import woundRegionData from "@/localdata/wound-location.json";
import woundTypesData from "@/localdata/wound-type.json";
import tissueTypesData from "@/localdata/tissue-type.json";
import exudateTypesData from "@/localdata/exudate-type.json";
import exudateAmountData from "@/localdata/exudate-amount.json";
import skinAroundData from "@/localdata/skin-around.json";
import woundEdgesData from "@/localdata/wound-edges.json";
import _commonComorbidities from "@/localdata/common-comorbidities.json";

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
export const commonComorbidities: Record<string, {
    cid11_code: string;
    name: string;
}> = _commonComorbidities;
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
    if (!key) return "";
    
    // Se a chave contiver espaço, pode ser um formato combinado "região subregião"
    if (key.includes(' ')) {
        const parts = key.split(' ');
        const regionKey = parts[0];
        if (!regionKey) return "";
        return woundRegion[regionKey]?.description || "";
    }
    return woundRegion[key]?.description || "";
}

export function getSubregionDescription(regionKey: string, subregionKey: string): string {
    // Se a região contiver espaço, pode ser um formato combinado "região subregião"
    let region: string = regionKey || '';
    let subregion: string = subregionKey || '';
    
    // Se a região contiver espaço, extrair apenas a parte da região
    if (region && region.includes(' ')) {
        const parts = region.split(' ');
        region = parts[0] || '';
        // Se não foi fornecida uma subregião separada, usar a segunda parte da região
        if (!subregion && parts.length > 1) {
            subregion = parts[1] || '';
        }
    }
    
    if (!region) return "";
    const subregions = woundRegion[region]?.subregions;
    if (!subregions || !subregion) return "";
    return subregions[subregion] || "";
}

export function getSkinAround(key: string): string {
    return skinAround[key] || "";
}

export function getWoundEdges(key: string): string {
    return woundEdges[key] || "";
}