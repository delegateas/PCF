import { ITreeNode } from "../Models/TreeNode";

export interface IFetcher{
    fetchTrees(): Promise<ITreeNode[]>;
}