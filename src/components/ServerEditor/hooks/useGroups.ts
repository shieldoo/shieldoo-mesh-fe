import { Group, useCodeListGroupsQuery } from "../../../api/generated";

export function useGroups() {
  const { data: groupsData, isFetching: isFetchingGroups } = useCodeListGroupsQuery();

  const getGroupNames = () => {
    return groupsData?.codelistGroups?.map(g => g.name) || [];
  };
  const getIdsFromNames = (groups: Group[]): number[] => {
    return groups.map((g: Group) => {
      return groupsData?.codelistGroups?.find((go: any) => go.name === g)?.id || 0;
    });
  };
  return {
    getGroupNames,
    getIdsFromNames,
    isFetchingGroups,
  };
}
