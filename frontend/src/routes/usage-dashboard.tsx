import React from "react";
import { useTranslation } from "react-i18next";
import { LoaderCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { usageDashboardService } from "#/api/usage-dashboard-service";
import { useSelectedOrganization } from "#/context/use-selected-organization";
import { Typography } from "#/ui/typography";
import { createPermissionGuard } from "#/utils/org/permission-guard";

export const clientLoader = createPermissionGuard("view_analytics");

export const handle = { hideTitle: true };

function UsageDashboard() {
  const { t } = useTranslation();
  const selectedOrg = useSelectedOrganization();

  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["usage-dashboard", selectedOrg],
    queryFn: () => usageDashboardService.getDashboardData(selectedOrg),
    enabled: !!selectedOrg,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoaderCircle className="animate-spin" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Typography className="text-danger">
          {t("USAGE_DASHBOARD$ERROR_LOADING")}
        </Typography>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const maxActivityCount = Math.max(
    ...dashboardData.conversation_activity_30_days.map((day) => day.count),
    1,
  );

  return (
    <div className="p-6 space-y-6">
      <Typography className="text-2xl font-bold">
        {t("USAGE_DASHBOARD$TITLE")}
      </Typography>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-600">
          <Typography className="text-sm text-neutral-400 mb-2">
            {t("USAGE_DASHBOARD$TOTAL_CONVERSATIONS")}
          </Typography>
          <Typography className="text-3xl font-bold">
            {dashboardData.total_conversations.toLocaleString()}
          </Typography>
        </div>

        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-600">
          <Typography className="text-sm text-neutral-400 mb-2">
            {t("USAGE_DASHBOARD$AVERAGE_COST")}
          </Typography>
          <Typography className="text-3xl font-bold">
            ${dashboardData.average_cost_per_conversation.toFixed(4)}
          </Typography>
        </div>
      </div>

      {/* 30-Day Activity Chart */}
      <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-600">
        <Typography className="text-lg font-semibold mb-4">
          {t("USAGE_DASHBOARD$30_DAY_ACTIVITY")}
        </Typography>
        <div className="flex items-end justify-between gap-1 h-48">
          {dashboardData.conversation_activity_30_days.map((day) => {
            const heightPercentage =
              maxActivityCount > 0 ? (day.count / maxActivityCount) * 100 : 0;
            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center group relative"
              >
                <div
                  className="w-full bg-brand-500 hover:bg-brand-400 transition-colors rounded-t"
                  style={{ height: `${heightPercentage}%` }}
                />
                <div className="absolute -top-8 bg-neutral-700 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {new Date(day.date).toLocaleDateString()}: {day.count}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-neutral-400">
          <span>
            {dashboardData.conversation_activity_30_days[0]
              ? new Date(
                  dashboardData.conversation_activity_30_days[0].date,
                ).toLocaleDateString()
              : ""}
          </span>
          <span>
            {dashboardData.conversation_activity_30_days[
              dashboardData.conversation_activity_30_days.length - 1
            ]
              ? new Date(
                  dashboardData.conversation_activity_30_days[
                    dashboardData.conversation_activity_30_days.length - 1
                  ].date,
                ).toLocaleDateString()
              : ""}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top LLM Models */}
        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-600">
          <Typography className="text-lg font-semibold mb-4">
            {t("USAGE_DASHBOARD$TOP_LLM_MODELS")}
          </Typography>
          {dashboardData.top_llm_models.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.top_llm_models.map((model, index) => (
                <div key={model.model_name} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Typography className="text-sm truncate">
                      {model.model_name}
                    </Typography>
                  </div>
                  <div className="flex-shrink-0">
                    <Typography className="text-sm font-semibold">
                      {model.count.toLocaleString()}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Typography className="text-neutral-400 text-sm">
              {t("USAGE_DASHBOARD$NO_DATA")}
            </Typography>
          )}
        </div>

        {/* Top Users */}
        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-600">
          <Typography className="text-lg font-semibold mb-4">
            {t("USAGE_DASHBOARD$TOP_USERS")}
          </Typography>
          {dashboardData.top_users.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.top_users.map((user, index) => (
                <div key={user.user_id} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Typography className="text-sm truncate">
                      {user.user_email || user.user_id}
                    </Typography>
                  </div>
                  <div className="flex-shrink-0">
                    <Typography className="text-sm font-semibold">
                      {user.conversation_count.toLocaleString()}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Typography className="text-neutral-400 text-sm">
              {t("USAGE_DASHBOARD$NO_DATA")}
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
}

export default UsageDashboard;
