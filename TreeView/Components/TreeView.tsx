import * as React from 'react';
import {Tree, Input, Skeleton, Empty, Alert} from 'antd';
import { ITreeNode } from '../Models/TreeNode';
import { IFetcher } from '../Fetchers/IFetcher';
import { AntTreeNode } from 'antd/lib/tree';
const { TreeNode } = Tree;
const { Search } = Input;

export interface ITreeViewProps{
    fetcher: IFetcher;
    openWindow: (node: ITreeNode) => void;
    maxHeight?: number;
}

export function TreeWithSearch(props: ITreeViewProps){
    // STATES
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [tree, setTree] = React.useState<ITreeNode[]>([]);
    const [search, setSearch] = React.useState('');
    const [expandKeys, setExpandKeys] = React.useState<string[]>([]);
    const [autoExpandParent, setAutoExpandParent] = React.useState(true);
    const [errorMsg, setErrorMsg] = React.useState('');

    // EFFECTS (onload)
    React.useEffect(() => {
        let fetcher = props.fetcher;
        fetcher.fetchTrees().then(v => {
            setTree(v);
            setExpandKeys(() => keysOfAllParents(v));
            setIsLoaded(true);
        }).catch(e => {
            setTree([]);
            setErrorMsg(e);
            setIsLoaded(true);
        });
    }, [props.fetcher]);

    // FUNCTIONS
    let keysOfAllParents = (t: ITreeNode[] | undefined): string[] => {
        if(t === undefined) return[];
        let parents = t.filter(i => i.children !== undefined);
        if (parents.length < 1) return [];
        let childKeys: string[] = [];
        parents.forEach(i => childKeys = childKeys.concat(keysOfAllParents(i.children)))
        return childKeys.concat(parents.map(i => i.id));
    };

    let onExpand = (expandedKeys: string[]) => {
        setExpandKeys(expandedKeys);
        setAutoExpandParent(false);
    };

    let findNameInTree = (n: string, t: ITreeNode[]): ITreeNode[] => {
        let nodes = t.filter(i => i.title.toLowerCase().includes(n.toLowerCase()));
        let childNodes: ITreeNode[] = [];
        t.forEach(i => {
            if(i.children) childNodes = childNodes.concat(findNameInTree(n, i.children))
        });
        return nodes.concat(childNodes);
    };

    let findFromIdInTree = (id: string, t: ITreeNode[]): ITreeNode | undefined => {
        let nodes = t.filter(i => i.id === id);
        if(nodes.length > 0) return nodes[0]; // There may be only one!
        
        let childNode: ITreeNode | undefined = undefined;
        t.forEach(i => {
            if(i.children) {
                let tmpNode = findFromIdInTree(id, i.children);
                if(tmpNode !== undefined) childNode = tmpNode;
            } 
        });

        return childNode; 
    };

    let onSearch = (e) => {
        let { value } = e.target;
        let matchingNodes = findNameInTree(value, tree);

        if(matchingNodes.length < 1){
            setExpandKeys(keysOfAllParents(tree));
            setSearch('');
            return;
        }

        let keys = matchingNodes.map(i => i.id);
        setExpandKeys(keys);
        setSearch(value);
    };

    let onDoubleClick = (e, n: AntTreeNode) => {
        let id = n.props.eventKey;
        if(id === undefined) return;
        try {
            let node = findFromIdInTree(id, tree);
            if(node === undefined) return; 
            props.openWindow(node);
        } catch (error) {
            console.error(error);
        }
    };

    let generateTree = (Tree: ITreeNode[]) => {
        return Tree.map(node => {
            let index = node.title.toLowerCase().indexOf(search.toLowerCase());
            let title = node.title.toLowerCase().includes(search.toLowerCase()) ? (
                <span>
                    {node.title.substring(0, index)}
                    <strong>{search}</strong>
                    {node.title.substr(index + search.length)}
                </span>
            ) : (
                <span>{node.title}</span>
            );
            return (
                <TreeNode key={node.id} title={title}>
                    {node.children !== undefined && generateTree(node.children)}
                </TreeNode>
            );
        });
    };

    // STYLE
    let containerStyle: React.CSSProperties = {padding: '10px', textAlign: 'left'}; 
    containerStyle = props.maxHeight ? 
        {
            ...containerStyle, 
            maxHeight: props.maxHeight,
            display: 'flex',
            flexDirection: 'column'
        } : containerStyle; 
        
    // RENDER
    return(
        <div style={containerStyle}>
            {errorMsg === '' || <Alert message="Error" description={errorMsg} type="error" showIcon />}
            {isLoaded && <Search allowClear style={{ marginBottom: 8 }} placeholder="Search" onChange={onSearch} />}
            {!isLoaded ? 
                <Skeleton active/> : 
                tree.length < 1 ?
                    <Empty/> :
                    <Tree 
                        style={{overflow: "auto"}}
                        onExpand={onExpand} 
                        expandedKeys={expandKeys} 
                        autoExpandParent={autoExpandParent}
                        onDoubleClick={onDoubleClick}>
                        {generateTree(tree)}
                    </Tree>}
        </div>
    )
}