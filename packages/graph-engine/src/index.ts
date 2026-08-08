export interface GraphNode {
  id: string;
  label: string;
  type: 'asset' | 'user' | 'service' | 'technique' | 'control' | 'event';
  metadata?: Record<string, string>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  status?: 'observed' | 'expected' | 'gap' | 'validated';
}

export interface OperationsGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export class GraphEngine {
  constructor(private readonly graph: OperationsGraph = { nodes: [], edges: [] }) {}

  addNode(node: GraphNode): void {
    if (!this.graph.nodes.some((item) => item.id === node.id)) this.graph.nodes.push(node);
  }

  addEdge(edge: GraphEdge): void {
    if (!this.graph.edges.some((item) => item.id === edge.id)) this.graph.edges.push(edge);
  }

  selectNode(id: string): GraphNode | undefined {
    return this.graph.nodes.find((node) => node.id === id);
  }

  neighbors(id: string): GraphNode[] {
    const ids = new Set<string>();
    for (const edge of this.graph.edges) {
      if (edge.source === id) ids.add(edge.target);
      if (edge.target === id) ids.add(edge.source);
    }
    return this.graph.nodes.filter((node) => ids.has(node.id));
  }

  snapshot(): OperationsGraph {
    return structuredClone(this.graph);
  }
}
