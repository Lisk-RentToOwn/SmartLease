// utils/generateReceipt.ts

import PDFDocument from "pdfkit";
import blobStream from "blob-stream";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { parse } from "json2csv";
import { readContract } from "@wagmi/core";
import { RENT_TO_OWN_ABI, RENT_TO_OWN_ADDRESS } from "@/constants/contracts";
import { createPublicClient, http } from "viem";
import { liskSepolia } from "viem/chains";
import { fetchJson } from "@/utils/ipfsUtils";

export interface ReceiptData {
  tenantAddress: string;
  landlordAddressMasked: string;
  name: string;
  propertyAddress: string;
  city: string;
  state: string;
  zipCode: string;
  currency: string;
  amountPaid: string;
  totalPaid: string;
  remaining: string;
  equity: string;
  date: string;
}

export const generatePdfReceipt = (data: ReceiptData) => {
  const doc = new PDFDocument();
  const stream = doc.pipe(blobStream());

  doc.fontSize(20).text("SmartLease Rent Receipt", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`🏠 Property: ${data.name}`);
  doc.text(`📍 Address: ${data.propertyAddress}, ${data.city}, ${data.state}, ${data.zipCode}`);
  doc.text(`💱 Currency: ${data.currency}`);
  doc.moveDown();

  doc.text(`🧾 Amount Paid: ${data.amountPaid} ${data.currency}`);
  doc.text(`📊 Total Paid: ${data.totalPaid} ${data.currency}`);
  doc.text(`💸 Remaining: ${data.remaining} ${data.currency}`);
  doc.text(`📈 Equity Earned: ${data.equity}%`);
  doc.text(`📅 Date: ${data.date}`);
  doc.moveDown();

  doc.text(`👤 Tenant Address: ${data.tenantAddress}`);
  doc.text(`🏦 Landlord Address: ${data.landlordAddressMasked}`);

  doc.end();

  stream.on("finish", function () {
    const url = stream.toBlobURL("application/pdf");
    const a = document.createElement("a");
    a.href = url;
    a.download = `rent-receipt-${data.date}.pdf`;
    a.click();
  });
};

export const generateCsvReceipt = (data: ReceiptData) => {
  const fields = Object.keys(data);
  const opts = { fields };
  const csv = parse(data, opts);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `rent-receipt-${data.date}.csv`);
};

export const generateDocxReceipt = async (data: ReceiptData) => {
  const doc = new Document();
  const lines = [
    "SmartLease Rent Receipt",
    `🏠 Property: ${data.name}`,
    `📍 Address: ${data.propertyAddress}, ${data.city}, ${data.state}, ${data.zipCode}`,
    `💱 Currency: ${data.currency}`,
    `🧾 Amount Paid: ${data.amountPaid} ${data.currency}`,
    `📊 Total Paid: ${data.totalPaid} ${data.currency}`,
    `💸 Remaining: ${data.remaining} ${data.currency}`,
    `📈 Equity Earned: ${data.equity}%`,
    `📅 Date: ${data.date}`,
    `👤 Tenant Address: ${data.tenantAddress}`,
    `🏦 Landlord Address: ${data.landlordAddressMasked}`,
  ];

  const children = lines.map(line => new Paragraph({ children: [new TextRun(line)] }));
  doc.addSection({ children });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `rent-receipt-${data.date}.docx`);
};

export const fetchReceiptData = async (propertyId: number, tenantAddress: string): Promise<ReceiptData> => {
  const client = createPublicClient({ chain: liskSepolia, transport: http() });

  const [
    metadataUri,
    [landlord, value],
    totalPaidBN,
    equityBN
  ] = await Promise.all([
    readContract({
      address: RENT_TO_OWN_ADDRESS,
      abi: RENT_TO_OWN_ABI,
      functionName: "getPropertyMetadata",
      args: [propertyId]
    }),
    readContract({
      address: RENT_TO_OWN_ADDRESS,
      abi: RENT_TO_OWN_ABI,
      functionName: "getBasicPropertyDetails",
      args: [propertyId]
    }),
    readContract({
      address: RENT_TO_OWN_ADDRESS,
      abi: RENT_TO_OWN_ABI,
      functionName: "getTenantTotalPaid",
      args: [propertyId, tenantAddress]
    }),
    readContract({
      address: RENT_TO_OWN_ADDRESS,
      abi: RENT_TO_OWN_ABI,
      functionName: "getTenantEquity",
      args: [propertyId, tenantAddress]
    })
  ]);

  const metadata = await fetchJson(metadataUri as string);
  const totalPaid = Number(totalPaidBN) / 1e18;
  const equity = Number(equityBN) / 100;
  const landlordMasked = landlord.slice(0, 7) + "..." + landlord.slice(-4);
  const remaining = Number(value) / 1e18 - totalPaid;

  return {
    tenantAddress,
    landlordAddressMasked: landlordMasked,
    name: metadata.name,
    propertyAddress: metadata.propertyAddress,
    city: metadata.city,
    state: metadata.state,
    zipCode: metadata.zipCode,
    currency: metadata.currency,
    amountPaid: totalPaid.toFixed(2),
    totalPaid: totalPaid.toFixed(2),
    remaining: remaining.toFixed(2),
    equity: equity.toFixed(2),
    date: new Date().toLocaleDateString()
  };
};
