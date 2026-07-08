import { DataList } from "../../components/DataList";
import { Screen } from "../../components/Screen";
import { StatusChip } from "../../components/StatusChip";
import { useApiResource } from "../../hooks/useApiResource";

export function MaterialsScreen() {
  const { data, isLoading } = useApiResource<Array<Record<string, unknown>>>("/vendors/my-orders", []);

  return (
    <Screen title="المواد" subtitle="طلبات شراء المواد والمنتجات من المتاجر.">
      <StatusChip label={`${data.length} طلب متجر`} tone={data.length > 0 ? "warning" : "neutral"} />
      <DataList title="طلبات المتاجر" items={data} isLoading={isLoading} />
    </Screen>
  );
}
