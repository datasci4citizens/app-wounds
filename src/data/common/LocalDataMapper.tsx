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
    // Se a chave contiver espaço, pode ser um formato combinado "região subregião"
    if (key && key.includes(' ')) {
        const [regionKey] = key.split(' ');
        return woundRegion[regionKey]?.description || "";
    }
    return woundRegion[key]?.description || "";
}

export function getSubregionDescription(regionKey: string, subregionKey: string): string {
    // Se a região contiver espaço, pode ser um formato combinado "região subregião"
    let region = regionKey;
    let subregion = subregionKey;
    
    // Se a região contiver espaço, extrair apenas a parte da região
    if (regionKey && regionKey.includes(' ')) {
        const parts = regionKey.split(' ');
        region = parts[0];
        // Se não foi fornecida uma subregião separada, usar a segunda parte da região
        if (!subregionKey && parts.length > 1) {
            subregion = parts[1];
        }
    }
    
    const subregions = woundRegion[region]?.subregions;
    return subregions?.[subregion] || "";
}

export function getSkinAround(key: string): string {
    return skinAround[key] || "";
}

export function getWoundEdges(key: string): string {
    return woundEdges[key] || "";
}