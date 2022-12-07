
class TreeNode {
  private children: TreeNode[] = [];
  private parent: TreeNode | null = null;
  private title: string = '';
  private datas: any[] = [];
  private id: string = '';
  private type: string = 'folder';

  constructor(title: string, type: string = 'folder') {
    this.title = title;
    this.id = this.uuidv4();
    this.type = type;
  }

  uuidv4(): string {
    return 'treeNode-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  getData(): any[] {
    return this.datas;
  }

  addData(data: any){
    this.datas.push(data);
  }

  getPathTitle() {
    let cursor: TreeNode = this;
    const pathTitle: string[] = [];
    while (cursor.parent !== null) {
      pathTitle.push(cursor.title);
      cursor = cursor.parent;
    }

    return pathTitle.reverse().join("/");
  }

  setParentNode(parentNode: TreeNode) {
    if (parentNode) {
      this.parent = parentNode;
    }
  }

  lastFolderIndex() {
    // 크롬 97이상 있으나 pollyfill 때문에 만들어서 사용
    let findFolderEndIndex = 0;
    for(let i = this.children.length-1 ; i >= 0 ; i--) {
      if (this.children[i].type === 'folder') {
        findFolderEndIndex = i;
        break;
      }
    }

    return findFolderEndIndex;
  }

  firstItemIndex() {
    return this.children.findIndex((child) => child.type === 'item');
  }

  addChildNode(childNode: TreeNode) {
    // console.log("childNode 를 정렬합니다. ", childNode, this.children);
    // let findFolderEndIndex = this.lastFolderIndex();
    // findFolderEndIndex = childNode.type === 'folder' ? findFolderEndIndex : this.children.length;
    // this.children.splice(findFolderEndIndex, 0, childNode);
    this.children.push(childNode);
    this.children.sort((a, b) => {
      if (a.type > b.type) return 1;
      else if (a.type < b.type) return -1;

      if (a.title > b.title) return 1;
      else if (a.title < b.title) return -1;
    })
  }

  findChildTitle(title: string): TreeNode | undefined {
    return this.children.find((child) => child.title === title);
  }

  addChildPath(paths: string[]): TreeNode {
    let cursor: TreeNode = this;
    if (paths !== undefined) {
      paths.forEach((path) => {
        const findChild = cursor.findChildTitle(path);
        if (findChild === undefined) {
          const newChild = new TreeNode(path);
          cursor.addChildNode(newChild);
          newChild.setParentNode(cursor);
          cursor = newChild;
        } else {
          cursor = findChild;
        }
      });
    }

    return cursor;
  }

  print() {
    return JSON.stringify(this, (key, value) => {
      if (key === 'parent' && value) {
        return value.id;
      }
      else return value;
    });
  }
}

class Tree {
  private rootNode: TreeNode;
  private pathSeparateChar: string = '/';
  constructor(rootNode?: TreeNode){
    if(rootNode){
      this.rootNode = rootNode;
    } else {
      this.rootNode = new TreeNode('root');
    }
  }

  setPathSeparateChar(char: string) {
    this.pathSeparateChar = char;
  }

  addChildPathNodeData(paths: string[], data: any) {
    let childNode = this.rootNode;
    if (paths.length > 1) {
      childNode = this.rootNode.addChildPath(paths.splice(1));
    }

    const newNode = new TreeNode(data?.title ?? 'item', data?.type ?? 'item');
    newNode.addData(data);
    childNode.addChildNode(newNode);
    return childNode;
  }

  addChildPathOnlyItemNodeData(paths: string[], data: any) {
    let childNode = this.rootNode;
    if (paths.length > 0) {
      childNode = this.rootNode.addChildPath(paths);
    }

    const newNode = new TreeNode(data?.name ?? 'item', data?.type ?? 'item');
    newNode.addData(data);
    childNode.addChildNode(newNode);
    return childNode;
  }

  getPathArray(path: string): string[] {
    return path.split(this.pathSeparateChar);
  }

  print() {
    return this.rootNode.print();
  }
}


const useTree = () => {
  const makeTree = () => {
    return new Tree();
  }
  return {
    makeTree
  }
}

export {
  Tree,
  TreeNode,
}

export default useTree;
