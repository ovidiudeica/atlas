import type {Territory} from './territories';
export function territorialRoleLabels(entity:Territory):readonly string[];
export function territorialRoleLabel(entity:Territory):string;
export function municipalRoleClarification(entity:Territory,lang?:'ro'|'en'):string|null;
