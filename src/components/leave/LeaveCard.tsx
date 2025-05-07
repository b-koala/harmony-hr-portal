
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LeaveQuota } from '@/types';

interface LeaveCardProps {
  leaveQuota: LeaveQuota | null;
}

const LeaveCard: React.FC<LeaveCardProps> = ({ leaveQuota }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Leave Balance</CardTitle>
      </CardHeader>
      <CardContent>
        {leaveQuota ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Annual Leave Quota</p>
                <p className="text-2xl font-bold">{leaveQuota.totalDays} days</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold text-primary">{leaveQuota.remainingDays} days</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used ({leaveQuota.usedDays} days)</span>
                <span>Total ({leaveQuota.totalDays} days)</span>
              </div>
              <Progress value={(leaveQuota.usedDays / leaveQuota.totalDays) * 100} />
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p>No leave quota data available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaveCard;
