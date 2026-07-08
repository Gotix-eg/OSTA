import { View } from "react-native";

import { DataList } from "../../components/DataList";
import { Screen } from "../../components/Screen";
import { StatTile } from "../../components/StatTile";
import { useApiResource } from "../../hooks/useApiResource";
import { spacing } from "../../theme/spacing";

type WorkerDashboard = {
  summary?: {
    incomingRequests?: number;
    activeJobs?: number;
    monthlyEarnings?: number;
    rating?: number;
    orderQuota?: number;
  };
  queue?: Array<Record<string, unknown>>;
};

export function WorkerDashboardScreen() {
  const { data, isLoading } = useApiResource<WorkerDashboard>("/workers/dashboard", {});
  const summary = data.summary ?? {};

  return (
    <Screen title="لوحة العامل" subtitle="أرقامك وطلباتك تأتي مباشرة من حساب العامل.">
      <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.md }}>
        <StatTile label="طلبات واردة" value={summary.incomingRequests ?? 0} />
        <StatTile label="أعمال نشطة" value={summary.activeJobs ?? 0} tone="accent" />
        <StatTile label="تقييمك" value={summary.rating ?? 0} tone="success" />
        <StatTile label="الكوتة" value={summary.orderQuota ?? 0} tone="warning" />
      </View>
      <DataList title="قائمة الانتظار" items={data.queue ?? []} isLoading={isLoading} />
    </Screen>
  );
}
