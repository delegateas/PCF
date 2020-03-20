export interface RelationshipMap {
    entityName: string;
    titleField: string;
    link?: string;
    parentLinkField?: string;
    children?: RelationshipMap[];
}