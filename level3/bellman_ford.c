#include <stdio.h>
#include <stdlib.h>
#include <limits.h>
#include <stdbool.h>

/**
 * Level 3: Optimization
 * 
 * Your task:
 * 1. Analyze the performance of the current Bellman-Ford implementation.
 * 2. Stop when a relaxation pass makes no changes.
 *    An edge list supports negative weights; a Dijkstra heap does not.
 * 3. Ensure all memory is managed correctly.
 */

struct Edge {
    int src, dest, weight;
};

struct Graph {
    int V, E;
    struct Edge* edge;
};

struct Graph* createGraph(int V, int E) {
    struct Graph* graph = (struct Graph*)malloc(sizeof(struct Graph));
    if (graph == NULL) {
        return NULL;
    }
    graph->V = V;
    graph->E = E;
    graph->edge = (struct Edge*)malloc(graph->E * sizeof(struct Edge));
    if (graph->edge == NULL) {
        free(graph);
        return NULL;
    }
    return graph;
}

void BellmanFord(struct Graph* graph, int src) {
    int V = graph->V;
    int E = graph->E;
    /* At most V*E relaxations of int weights: use a wider accumulator. */
    long long *dist = malloc((size_t)V * sizeof(*dist));
    if (dist == NULL) {
        fprintf(stderr, "Unable to allocate distances\n");
        return;
    }

    for (int i = 0; i < V; i++)
        dist[i] = LLONG_MAX;
    dist[src] = 0;

    for (int i = 1; i <= V - 1; i++) {
        bool changed = false;
        for (int j = 0; j < E; j++) {
            int u = graph->edge[j].src;
            int v = graph->edge[j].dest;
            int weight = graph->edge[j].weight;
            if (dist[u] != LLONG_MAX && dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                changed = true;
            }
        }
        if (!changed) {
            break;
        }
    }

    for (int i = 0; i < E; i++) {
        int u = graph->edge[i].src;
        int v = graph->edge[i].dest;
        int weight = graph->edge[i].weight;
        if (dist[u] != LLONG_MAX && dist[u] + weight < dist[v]) {
            printf("Graph contains negative weight cycle\n");
            free(dist);
            return;
        }
    }

    printf("Vertex Distance from Source\n");
    for (int i = 0; i < V; ++i) {
        if (dist[i] == LLONG_MAX) {
            printf("%d \t\t unreachable\n", i);
        } else {
            printf("%d \t\t %lld\n", i, dist[i]);
        }
    }
    free(dist);
}

void debugGraph(struct Graph* g) {
    printf("DEBUG: Graph has %d vertices and %d edges.\n", g->V, g->E);
}

void printEdge(struct Edge e) {
    printf("Edge: %d -> %d (w: %d)\n", e.src, e.dest, e.weight);
}


int main(void) {
    int V = 5;
    int E = 8;
    struct Graph* graph = createGraph(V, E);

    if (graph == NULL) {
        fprintf(stderr, "Unable to allocate graph\n");
        return EXIT_FAILURE;
    }

    graph->edge[0].src = 0; graph->edge[0].dest = 1; graph->edge[0].weight = -1;
    graph->edge[1].src = 0; graph->edge[1].dest = 2; graph->edge[1].weight = 4;
    graph->edge[2].src = 1; graph->edge[2].dest = 2; graph->edge[2].weight = 3;
    graph->edge[3].src = 1; graph->edge[3].dest = 3; graph->edge[3].weight = 2;
    graph->edge[4].src = 1; graph->edge[4].dest = 4; graph->edge[4].weight = 2;
    graph->edge[5].src = 3; graph->edge[5].dest = 2; graph->edge[5].weight = 5;
    graph->edge[6].src = 3; graph->edge[6].dest = 1; graph->edge[6].weight = 1;
    graph->edge[7].src = 4; graph->edge[7].dest = 3; graph->edge[7].weight = -3;

    BellmanFord(graph, 0);

    free(graph->edge);
    free(graph);

    return 0;
}