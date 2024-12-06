import woundRegionData from "@/localdata/wound-location.json";
import woundTypesData from "@/localdata/wound-type.json";
import tissueTypesData from "@/localdata/tissue-type.json";
import exudateTypesData from "@/localdata/exudate-type.json";
import exudateAmountData from "@/localdata/exudate-amount.json";
import skinAroundData from "@/localdata/skin-around.json";
import woundEdgesData from "@/localdata/wound-edges.json";

type WoundRegion = {
    description: string;
    subregions: Record<string, string>;
};
type TissueType = {
    type: string;
    description: string;
};

const woundRegion: Record<string, WoundRegion> = woundRegionData;
const woundTypes: Record<string, string> = woundTypesData;
const tissueTypes: Record<string, TissueType> = tissueTypesData;
const exudateTypes: Record<string, string> = exudateTypesData;
const exudateAmount: Record<string, string> = exudateAmountData;
const skinAround: Record<string, string> = skinAroundData;
const woundEdges: Record<string, string> = woundEdgesData;

export function getTissueType(key: string): string {
    console.log(key)
    return tissueTypes[key]?.type || "";
}

export function getExudateType(key: string): string {
    return exudateTypes[key] || "";
}

export function getExudateAmount(key: string): string {
    return exudateAmount[key] || "";
}

export function getWoundType(key: string): string {
    return woundTypes[key] || "";
}

export function getRegionDescription(key: string): string {
    return woundRegion[key]?.description || "";
}

export function getSubregionDescription(regionKey: string, subregionKey: string): string {
    const subregions = woundRegion[regionKey]?.subregions;
    return subregions?.[subregionKey] || "";
}

export function getSkinAround(key: string): string {
    return skinAround[key] || "";
}

export function getWoundEdges(key: string): string {
    return woundEdges[key] || "";
}