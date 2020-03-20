import { IFetcher } from "./IFetcher";
import { ITreeNode } from "../Models/TreeNode";

export class MockFetcher implements IFetcher {
    public fetchTrees(): Promise<ITreeNode[]> {
        return new Promise<ITreeNode[]>((resolve, reject) => {
            resolve([
                {
                    id: '1',
                    entityName: 'notimportant',
                    title: 'title',
                    children: [
                        {
                            id: '11',
                            title: 'title11',
                            entityName: 'notimportant',
                            children: [
                                {
                                    id: '111',
                                    entityName: 'notimportant',
                                    title: 'title111'
                                },
                                {
                                    id: '112',
                                    entityName: 'notimportant',
                                    title: 'title112'
                                },
                                {
                                    id: '113',
                                    entityName: 'notimportant',
                                    title: 'title113'
                                },
                                {
                                    id: '114',
                                    entityName: 'notimportant',
                                    title: 'title114'
                                }
                            ]
                        },
                        {
                            id: '12',
                            entityName: 'notimportant',
                            title: 'title12',
                            children: [
                                {
                                    id: '121',
                                    entityName: 'notimportant',
                                    title: 'title121'
                                },
                                {
                                    id: '122',
                                    entityName: 'notimportant',
                                    title: 'title122'
                                },
                                {
                                    id: '123',
                                    entityName: 'notimportant',
                                    title: 'title123'
                                }
                            ]
                        },
                        {
                            id: '13',
                            entityName: 'notimportant',
                            title: 'title13'
                        }
                    ]
                },
                {
                    id: '2',
                    entityName: 'notimportant',
                    title: 'title2'
                }
            ]);
        });
    }
}