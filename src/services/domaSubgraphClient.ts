// GraphQL Client Configuration for Doma Subgraph
import { GraphQLClient } from 'graphql-request';

// Subgraph endpoints
const DOMA_SUBGRAPH_ENDPOINTS = {
  testnet: 'https://api-testnet.doma.xyz/graphql',
  mainnet: 'https://api-mainnet.doma.xyz/graphql', // When available
  local: 'http://localhost:4000/graphql' // For local development
};

export class DomaSubgraphClient {
  private endpoint: string;
  private client: GraphQLClient;

  constructor(environment: keyof typeof DOMA_SUBGRAPH_ENDPOINTS = 'testnet') {
    this.endpoint = DOMA_SUBGRAPH_ENDPOINTS[environment];
    this.client = new GraphQLClient(this.endpoint, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async query<T = Record<string, unknown>>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    try {
      return await this.client.request<T>(query, variables);
    } catch (error) {
      console.error('Doma Subgraph Query Error:', error);
      throw new Error(`Doma Subgraph request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Change environment (testnet/mainnet/local)
  setEnvironment(environment: keyof typeof DOMA_SUBGRAPH_ENDPOINTS): void {
    if (!DOMA_SUBGRAPH_ENDPOINTS[environment]) {
      throw new Error(`Invalid environment: ${environment}`);
    }
    this.endpoint = DOMA_SUBGRAPH_ENDPOINTS[environment];
    this.client = new GraphQLClient(this.endpoint, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Get current endpoint
  getEndpoint(): string {
    return this.endpoint;
  }

  // Set custom headers
  setHeaders(headers: Record<string, string>): void {
    this.client.setHeaders(headers);
  }

  // Add authentication token
  setAuthToken(token: string): void {
    this.client.setHeader('Authorization', `Bearer ${token}`);
  }
}

export default DomaSubgraphClient;
