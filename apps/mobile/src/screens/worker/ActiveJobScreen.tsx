import { DataList } from "../../components/DataList";
import { Screen } from "../../components/Screen";
import { StatusChip } from "../../components/StatusChip";
import { useApiResource } from "../../hooks/useApiResource";

export function ActiveJobScreen() {
  const { data, isLoading } = useApiResource<Array<Record<string, unknown>>>("/workers/requests/active", []);

  return (
    <Screen title="الأعمال النشطة" subtitle="تابع حالات التنفيذ من قبول الطلب وحتى الإكمال.">
      <StatusChip label={`${data.length} قيد التنفيذ`} tone={data.length > 0 ? "warning" : "neutral"} />
      <DataList title="طلبات قيد التنفيذ" items={data} isLoading={isLoading} />
    </Screen>
  );
}
