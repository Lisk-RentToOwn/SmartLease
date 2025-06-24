import { Badge } from "../ui/badge";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { ProgressDemo } from "./ProgressDemo";
import {
  useTenantTokenStats,
  useTenantEquity,
} from "@/hooks/property/useTenant";
import { Medal, Check, Lock } from "lucide-react";
import React from "react";

type Milestone = {
  tier: string;
  goal: string;
  unlocked?: string;
  progress: number;
};

interface MilestoneProgressProps {
  address?: string;
  propertyId?: number;
}

const defaultMilestones: Milestone[] = [
  {
    tier: "Bronze Tier",
    goal: "Reached 25% ownership (25 tokens)",
    unlocked: "Priority maintenance requests",
    progress: 0,
  },
  {
    tier: "Silver Tier",
    goal: "Reached 50% ownership (50 tokens)",
    unlocked: "Property improvement voting rights",
    progress: 0,
  },
  {
    tier: "Gold Tier",
    goal: "Reached 75% ownership (75 tokens)",
    unlocked: "Reduced monthly payments",
    progress: 0,
  },
  {
    tier: "Platinum Tier",
    goal: "Reached 100% ownership (100 tokens)",
    unlocked: "Full property modification rights",
    progress: 0,
  },
];

const MilestoneProgress: React.FC<MilestoneProgressProps> = ({
  address,
  propertyId,
}) => {
  const { stats } = useTenantTokenStats(address, propertyId); // Get token info
  const { data: equityData } = useTenantEquity(address, propertyId); // Get equity %

  const totalTokens = 100;
  const tokensPerTier = totalTokens / defaultMilestones.length;

  const currentTokens = stats.unlocked;
  const currentMilestone = Math.floor(currentTokens / tokensPerTier);

  const currentTierStart = currentMilestone * tokensPerTier;
  const progressToNextTier = Math.min(
    ((currentTokens - currentTierStart) / tokensPerTier) * 100,
    100
  );

  const enrichedMilestones = defaultMilestones.map((milestone, index) => ({
    ...milestone,
    progress:
      index === currentMilestone
        ? parseFloat(progressToNextTier.toFixed(1))
        : 0,
  }));

  return (
    <div className="w-full  ">
      <ul className="space-y-6">
        {enrichedMilestones.map((milestone, index) => {
          const isCompleted = index < currentMilestone;
          const isCurrent = index === currentMilestone;

          return (
            <li key={index} className="flex space-x-4">
              {/* ✅ Milestone number or checkmark */}
              <div className="w-10 h-10 rounded-full flex-ic justify-center text-white">
                {isCompleted ? (
                  <Check className="notfi-icon bg-emerald-400" />
                ) : (
                  <div className="flex items-center justify-center bg-gray-300 notfi-icon">
                    {index + 1}
                  </div>
                )}
              </div>

              {/* ✅ Milestone card */}
              <Card
                className={`flex-1 ${
                  isCompleted
                    ? "bg-gradient-to-r from-emerald-400/10 to-white"
                    : "bg-white"
                }`}
              >
                <CardHeader className="flex-jb-ic flex-row !pb-3">
                  <div className="space-y-2">
                    <CardTitle className="text-dark">
                      {milestone.tier}
                    </CardTitle>
                    <CardDescription className="text-gray-bold">
                      {milestone.goal}
                    </CardDescription>
                  </div>

                  {/* 🏷️ Status Badge */}
                  <Badge variant={isCompleted ? "customGreen" : "customGray"}>
                    {isCompleted
                      ? "Completed"
                      : isCurrent
                      ? `In Progress (${milestone.progress}%)`
                      : "Locked"}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* 🔓 Unlock benefit */}
                  {milestone.unlocked && (
                    <p className="text-gray flex-ic gap-2">
                      {isCompleted || isCurrent ? (
                        <Medal className="notfi-icon bg-orange-500/50 text-yellow-600" />
                      ) : (
                        <Lock className="notfi-icon bg-rd-gray" />
                      )}
                      Unlocked: {milestone.unlocked}
                    </p>
                  )}

                  {/* 📊 Progress bar */}
                  {isCurrent && (
                    <div>
                      <ProgressDemo
                        value={milestone.progress}
                        className="progress-purple-fill"
                      />
                      <p className="text-gray text-right">
                        {milestone.progress}% complete
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MilestoneProgress;
