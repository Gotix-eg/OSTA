import { DataList } from "../../components/DataList";
import { Screen } from "../../components/Screen";
import { StatusChip } from "../../components/StatusChip";
import { useApiResource } from "../../hooks/useApiResource";

export function MyRequestsScreen() {
  const { data, isLoading } = useApiResource<Array<Record<string, unknown>>>("/clients/requests", []);

  return (
    <Screen title="طلباتي" subtitle="كل الطلبات محفوظة ومقروءة من API العملاء." showBack={false}>
      <StatusChip label={`${data.length} طلب`} tone={data.length > 0 ? "accent" : "neutral"} />
      <DataList title="الطلبات الحالية" items={data} isLoading={isLoading} />
    </Screen>
  );
}
