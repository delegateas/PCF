import { ITreeNode, IAnnotaionFields } from "../Models/TreeNode";
import { IInputs } from "../generated/ManifestTypes";
import { RelationshipMap } from "../Models/RelationshipMap";
import { IFetcher } from "./IFetcher";

export class DynamicsFetcher implements IFetcher{
    public constructor(
        private parentId: string, 
        private context: ComponentFramework.Context<IInputs>, 
        private relationshipMap: RelationshipMap){}

    private async fetchChild(parentId: string, parentName: string, relationMaps: RelationshipMap[]): Promise<ITreeNode[]> {
        let childrenNodes = await Promise.all(relationMaps.map(async relationMap => {
            if(relationMap.parentLinkField === undefined) throw new Error("Configuration error: A child is missing the parent link field.");
            let isAnnotation = relationMap.entityName === 'annotation'; // Annotations are a special case
            let query = isAnnotation ?
                this.createAnnotationQueryString(parentId, parentName, relationMap.parentLinkField!, relationMap.titleField) :
                this.createQueryString(parentId, parentName, relationMap.parentLinkField!, relationMap.titleField);
            
            let children = await this.context.webAPI.retrieveMultipleRecords(relationMap.entityName, query);
            let treeNodes: ITreeNode[] = children.entities.map(e => {
                let annotationField: IAnnotaionFields | undefined = !isAnnotation ? 
                    undefined :
                    {
                        mimetype: e["mimetype"],
                        body: e["documentbody"],
                        filename: e["filename"]
                    };
                
                return {
                    title: e[relationMap.titleField],
                    entityName: relationMap.entityName,
                    id: e[relationMap.entityName + "id"], // Noice
                    annotatoinFields: annotationField
                };
            });

            if(relationMap.children){
                treeNodes = await Promise.all(treeNodes.map(async t => {
                    let childsers = await this.fetchChild(t.id, relationMap.entityName, relationMap.children!);
                    return {
                        ...t,
                        children: childsers
                    };
                }));
            }
            return treeNodes;
        }));

        let combinedArray: ITreeNode[] = [];
        childrenNodes.forEach(i => combinedArray = combinedArray.concat(i));
        combinedArray.sort((a, b) => this.compareStrings(a.title, b.title));
        return Promise.resolve(combinedArray);
    }

    private compareStrings(a: string, b: string): number {
        if(a.toLowerCase() < b.toLowerCase()) return -1;
        if(a.toLowerCase() > b.toLowerCase()) return 1;
        return 0;
    }

    private createAnnotationQueryString(parentId: string, parentName: string, parentLinkField: string, titleField: string){
        return `?$select=${titleField},mimetype,documentbody&$filter=${parentLinkField} eq '${parentId}'`;
    }

    private createQueryString(parentId: string, parentName: string, parentLinkField: string, titleField: string): string {
        return `?$select=${titleField}&$filter=${parentLinkField}/${parentName}id eq '${parentId}'`;
    }

    public fetchTrees(): Promise<ITreeNode[]> {
        return new Promise<ITreeNode[]>(async (resolve, rejects) => {
            let parentEntity = await this.context.webAPI.retrieveRecord(this.relationshipMap.entityName, this.parentId);
            let parentNode: ITreeNode = {
                title: parentEntity[this.relationshipMap.titleField], 
                id: this.parentId,
                entityName: this.relationshipMap.entityName
             };
            if(!this.relationshipMap.children) { rejects("No children configured in map."); return; }
            
            try {
                parentNode.children = await this.fetchChild(
                    parentNode.id, 
                    this.relationshipMap.entityName, 
                    this.relationshipMap.children!
                );

                if(parentNode.children.length < 1) resolve([]); 
                resolve([parentNode]);
            } catch (error) {
                console.error(error);
                rejects(error instanceof Error ? `${error.name} - ${error.message}` : 'An error occured getting child information. See log.');
            }
        });
    }
}