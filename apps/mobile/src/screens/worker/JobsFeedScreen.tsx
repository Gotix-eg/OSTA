import { Alert } from "react-native";

import { apiClient } from "../../api/client";
import { AppButton } from "../../components/AppButton";
import { AppCard } from "../../components/AppCard";
import { DataList } from "../../components/DataList";
import { Screen } from "../../components/Screen";
import { StatusChip } from "../../components/StatusChip";
import { useApiResource } from "../../hooks/useApiResource";

export function JobsFeedScreen() {
  const { data, isLoading, reload } = useApiResource<Array<Record<string, unknown>>>("/workers/requests/incoming", []);

  async function acceptFirstJob() {
    const firstJob = data[0];
    const id = firstJob?.id;
    if (typeof id !== "string") {
      return;
    }
    try {
      await apiClient.patch(`/workers/requests/${id}/accept`, { price: 0, etaMinutes: 30 });
      await reload();
    } catch (error) {
      Alert.alert("تعذر قبول الطلب", error instanceof Error ? error.message : "حاول مرة أخرى");
    }
  }

  return (
    <Screen title="الطلبات المتاحة" subtitle="طلبات مفتوحة مطابقة لتخصصك ونطاق عملك.">
      <AppCard>
        <StatusChip label={`${data.length} طلب متاح`} tone={data.length > 0 ? "accent" : "neutral"} />
      </AppCard>
      <DataList title="طلبات قريبة" items={data} isLoading={isLoading} />
      <AppButton title="قبول أول طلب" variant="secondary" disabled={data.length === 0} onPress={acceptFirstJob} />
    </Screen>
  );
}
