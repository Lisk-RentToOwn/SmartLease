import { Contract, ethers, EventLog, JsonRpcProvider, InterfaceAbi } from "ethers";

export type ContractName = "RentToOwn" | "PropertyToken" | "IdentityProvider";

export type PropertyEvent = {
    type: string;
    contract: ContractName;
    blockNumber: number;
    txHash: string;
    timestamp?: number;
    args: Record<string, any>;
};

const PROVIDER = new JsonRpcProvider(`https://rpc.sepolia-api.lisk.com`);

const WS_PROVIDER = new ethers.WebSocketProvider(`wss://rpc.sepolia-api.lisk.com`);


export class PropertyEventService {
    private contracts: Record<ContractName, Contract>;
    private wsContracts: Record<ContractName, Contract>;

    constructor(
        rentToOwnAddress: string,
        rentToOwnAbi: InterfaceAbi,
        propertyTokenAddress: string,
        propertyTokenAbi: InterfaceAbi,
        identityProviderAddress: string,
        identityProviderAbi: InterfaceAbi
    ) {
        // Regular providers
        this.contracts = {
            RentToOwn: new Contract(rentToOwnAddress, rentToOwnAbi, PROVIDER),
            PropertyToken: new Contract(propertyTokenAddress, propertyTokenAbi, PROVIDER),
            IdentityProvider: new Contract(identityProviderAddress, identityProviderAbi, PROVIDER)
        };

        // WebSocket providers for real-time
        this.wsContracts = {
            RentToOwn: new Contract(rentToOwnAddress, rentToOwnAbi, WS_PROVIDER),
            PropertyToken: new Contract(propertyTokenAddress, propertyTokenAbi, WS_PROVIDER),
            IdentityProvider: new Contract(identityProviderAddress, identityProviderAbi, WS_PROVIDER)
        };
    }


  /* ------------------------- */
  /* CORE EVENT METHODS        */
  /* ------------------------- */

    async getEvents(
        contractName: ContractName,
        eventName: string,
        filters: Record<string, any> = {},
        fromBlock = 0,
        toBlock: number | string = "latest",
        pageSize = 50,
        page = 1
    ): Promise<{ events: PropertyEvent[]; total: number }> {
        const filter = this.contracts[contractName].filters[eventName](...Object.values(filters));
        const totalEvents = await this.contracts[contractName].queryFilter(filter, fromBlock, toBlock);
        
        const paginatedEvents = totalEvents.slice(
        (page - 1) * pageSize,
        page * pageSize
        );

        const events = await Promise.all(
        paginatedEvents.map(log => this.parseEvent(contractName, log))
        );

        return {
        events: events.filter(Boolean) as PropertyEvent[],
        total: totalEvents.length,
        };
    }

    onEvent(
        contractName: ContractName,
        eventName: string,
        callback: (event: PropertyEvent) => void,
        filters: Record<string, any> = {}
    ): () => void {
        const filter = this.wsContracts[contractName].filters[eventName](...Object.values(filters));
        
        const listener = async (log: EventLog) => {
        const parsed = await this.parseEvent(contractName, log);
        if (parsed) callback(parsed);
        };

        this.wsContracts[contractName].on(filter, listener);
        return () => this.wsContracts[contractName].off(filter, listener);
    }

    /* ------------------------- */
    /* RENT TO OWN SPECIFIC      */
    /* ------------------------- */

    async getLandlordProperties(landlordAddress: string): Promise<PropertyEvent[]> {
        const { events } = await this.getEvents(
        "RentToOwn",
        "PropertyCreated",
        { landlord: landlordAddress }
        );
        return events;
    }

    async getTenantAssignments(landlordAddress: string): Promise<{propertyId: number, tenants: string[]}[]> {
        const createdEvents = await this.getLandlordProperties(landlordAddress);
        const { events: occupiedEvents } = await this.getEvents("RentToOwn", "PropertyOccupied");
        
        return createdEvents.map(propEvent => {
        const propertyId = propEvent.args.propertyId;
        const tenants = occupiedEvents
            .filter(e => e.args.propertyId === propertyId)
            .map(e => e.args.tenant);
            
        return {
            propertyId,
            tenants: [...new Set(tenants)]
        };
        });
    }

    async getRentAnalysis(landlordAddress: string, year?: number): Promise<{
        month: string;
        collected: number;
        expected: number;
    }[]> {
        const currentYear = year || new Date().getFullYear();
        const properties = await this.getLandlordProperties(landlordAddress);
        
        const { events: allRentEvents } = await this.getEvents(
            "RentToOwn",
            "RentPaid",
            {},
            0,
            "latest",
            10000
        );
        
        const monthlyData = Array(12).fill(0).map((_, i) => {
            const month = String(i + 1).padStart(2, '0');
            return {
                month: `${currentYear}-${month}`,
                collected: 0,
                expected: 0
            };
        });
        
      // Calculate collected rent
        allRentEvents.forEach(event => {
            const date = new Date((event.timestamp || 0) * 1000);
            if (date.getFullYear() === currentYear) {
                const month = date.getMonth();
                monthlyData[month].collected += Number(ethers.formatUnits(event.args.amount, 18));
            }
        });
        
        // Calculate expected rent (from property values)
        properties.forEach(property => {
            const startDate = new Date((property.timestamp || 0) * 1000);
            const monthlyRent = Number(ethers.formatUnits(property.args.value, 18)) / 12;
            
            for (let month = 0; month < 12; month++) {
                if (startDate.getFullYear() <= currentYear) {
                    monthlyData[month].expected += monthlyRent;
                }
            }
        });

        return monthlyData;
    }


    /* ------------------------- */
    /* PROPERTY TOKEN SPECIFIC   */
    /* ------------------------- */

    async getTokenHolders(tokenId: number): Promise<{address: string, amount: number}[]> {
        const { events } = await this.getEvents(
            "PropertyToken",
            "PropertyTokenTransferred",
            { tokenId }
        );
        
        const holders = new Map<string, number>();
        
        events.forEach(event => {
        const from = event.args.from.toLowerCase();
        const to = event.args.to.toLowerCase();
        const amount = Number(ethers.formatUnits(event.args.amount, 18));
        
        // Subtract from sender
        if (from !== ethers.ZeroAddress) {
            holders.set(from, (holders.get(from) || 0) - amount);
        }
        
        // Add to receiver
        holders.set(to, (holders.get(to) || 0) + amount);
        });
        
        return Array.from(holders.entries())
        .filter(([, amount]) => amount > 0)
        .map(([address, amount]) => ({ address, amount }));
    }

    async getTokenDistribution(tokenId: number): Promise<{holder: string, percentage: number}[]> {
        const holders = await this.getTokenHolders(tokenId);
        const total = holders.reduce((sum, h) => sum + h.amount, 0);
        
        return holders.map(h => ({
            holder: h.address,
            percentage: (h.amount / total) * 100
        }));
    }



    /* ------------------------- */
    /* IDENTITY PROVIDER SPECIFIC */
    /* ------------------------- */

    async getUserRoles(userAddress: string): Promise<string[]> {
        const { events } = await this.getEvents(
        "IdentityProvider",
        "RoleAssigned",
        { user: userAddress }
        );
        
        return events.map(e => {
        switch(e.args.role) {
            case 0: return "Admin";
            case 1: return "Landlord";
            case 2: return "Tenant";
            default: return "Unknown";
        }
        });
    }


    /* ------------------------- */
    /* CROSS-CONTRACT METHODS    */
    /* ------------------------- */

    async getPropertyTimeline(
        propertyId: number,
        fromBlock = 0,
        toBlock: number | string = "latest"
    ): Promise<PropertyEvent[]> {
        const eventQueries = [
            this.getEvents("RentToOwn", "PropertyCreated", { propertyId }, fromBlock, toBlock)
                .then(res => res.events),
            this.getEvents("RentToOwn", "RentPaid", { propertyId }, fromBlock, toBlock)
                .then(res => res.events),
            this.getEvents("RentToOwn", "EquityUpdated", { propertyId }, fromBlock, toBlock)
                .then(res => res.events),
            this.getEvents("RentToOwn", "PropertyOccupied", { propertyId }, fromBlock, toBlock)
                .then(res => res.events),
            this.getEvents("PropertyToken", "PropertyTokenMinted", {}, fromBlock, toBlock)
                .then(res => res.events.filter(e => e.args.tokenId === propertyId)),
            this.getEvents("PropertyToken", "PropertyTokenTransferred", {}, fromBlock, toBlock)
                .then(res => res.events.filter(e => e.args.tokenId === propertyId))
        ];
    
        const results = await Promise.all(eventQueries);
        const allEvents = results.flat();
        
        return allEvents.sort((a, b) => b.blockNumber - a.blockNumber);
    }

    async getEquityDistribution(propertyId: number, months = 12): Promise<{month: string, equity: number}[]> {
        // Specify "RentToOwn" as the contract name for these events
        const { events } = await this.getEvents(
            "RentToOwn", 
            "EquityUpdated", 
            { propertyId }
        );
        
        const propertyResult = await this.getEvents(
            "RentToOwn",
            "PropertyCreated",
            { propertyId }
        );
        const property = propertyResult.events[0]?.args;
        
        const monthlyData = [];
        const now = new Date();
        const monthlyMilliseconds = 30 * 24 * 60 * 60 * 1000;
        
        for (let i = 0; i < months; i++) {
            const date = new Date(now.getTime() - (i * monthlyMilliseconds));
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            const eventsInMonth = events.filter(e => {
                const eventDate = new Date((e.timestamp || 0) * 1000);
                return (
                    eventDate.getFullYear() === date.getFullYear() && 
                    eventDate.getMonth() === date.getMonth()
                );
            });
            
            const equityChange = eventsInMonth.reduce((sum, e) => sum + Number(e.args.newEquity), 0);
            
            monthlyData.unshift({
                month: monthKey,
                equity: equityChange || 0
            });
        }
        
        return monthlyData;
    }

  /* ------------------------- */
  /* HELPER METHODS            */
  /* ------------------------- */

    private async parseEvent(
        contractName: ContractName,
        log: any
    ): Promise<PropertyEvent | null> {
        if (!(log instanceof EventLog)) return null;

        try {
            const block = await PROVIDER.getBlock(log.blockNumber);
            
            return {
                type: log.fragment.name,
                contract: contractName,
                blockNumber: log.blockNumber,
                txHash: log.transactionHash,
                timestamp: block?.timestamp,
                args: this.parseArgs(log.fragment, log.args),
            };
        } catch (error) {
            console.error(`Error parsing ${contractName} event:`, error);
            return null;
        }
    }

    private parseArgs(fragment: ethers.EventFragment, args: any): Record<string, any> {
        const result: Record<string, any> = {};
        fragment.inputs.forEach((input, index) => {
        result[input.name] = args[index];
        });
        return result;
    }
}