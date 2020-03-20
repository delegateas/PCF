export interface ITreeNode{
    id: string;
    entityName: string;
    title: string;
    children?: ITreeNode[];
    annotatoinFields?: IAnnotaionFields;
}

export interface IAnnotaionFields{
    mimetype: string;
    body: string;
    filename: string;
}