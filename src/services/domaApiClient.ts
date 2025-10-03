// @ts-nocheck
import { GraphQLClient } from 'graphql-request';
import axios from 'axios';

// Configuration
const DOMA_CONFIG = {
  testnet: {
    graphqlEndpoint: 'https://api-testnet.doma.xyz/graphql',
    restEndpoint: 'https://api-testnet.doma.xyz',
  },
  mainnet: {
    graphqlEndpoint: 'https://api-mainnet.doma.xyz/graphql', // When available
    restEndpoint: 'https://api-mainnet.doma.xyz',
  }
};

export interface DomaApiClientConfig {
  apiKey?: string;
  environment?: 'testnet' | 'mainnet';
  timeout?: number;
}

export class DomaApiClient {
  private environment: 'testnet' | 'mainnet';
  private endpoint: string;
  private restEndpoint: string;
  private apiKey: string | null;
  private graphQLClient: GraphQLClient;
  private timeout: number;

  constructor(config: DomaApiClientConfig = {}) {
    this.environment = config.environment || 'testnet';
    this.endpoint = DOMA_CONFIG[this.environment].graphqlEndpoint;
    this.restEndpoint = DOMA_CONFIG[this.environment].restEndpoint;
    this.apiKey = config.apiKey || null;
    this.timeout = config.timeout || 30000;
    
    // Initialize GraphQL client
    this.graphQLClient = new GraphQLClient(this.endpoint, {
      headers: this.getHeaders(),
      timeout: this.timeout,
    });
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  // Generic GraphQL query method
  async query<T = unknown>(gqlQuery: string, variables: Record<string, unknown> = {}): Promise<T> {
    try {
      return await this.graphQLClient.request<T>(gqlQuery, variables);
    } catch (error) {
      console.error('Doma API Query Error:', error);
      throw new Error(`Doma API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generic GraphQL mutation method
  async mutate<T = unknown>(gqlMutation: string, variables: Record<string, unknown> = {}): Promise<T> {
    try {
      return await this.graphQLClient.request<T>(gqlMutation, variables);
    } catch (error) {
      console.error('Doma API Mutation Error:', error);
      throw new Error(`Doma API mutation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // REST API methods for non-GraphQL endpoints
  async get<T = unknown>(path: string, params?: Record<string, unknown>): Promise<T> {
    try {
      const response = await axios.get(`${this.restEndpoint}${path}`, {
        headers: this.getHeaders(),
        params,
        timeout: this.timeout,
      });
      return response.data;
    } catch (error) {
      console.error('Doma REST API GET Error:', error);
      throw new Error(`Doma REST API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async post<T = unknown>(path: string, data?: unknown): Promise<T> {
    try {
      const response = await axios.post(`${this.restEndpoint}${path}`, data, {
        headers: this.getHeaders(),
        timeout: this.timeout,
      });
      return response.data;
    } catch (error) {
      console.error('Doma REST API POST Error:', error);
      throw new Error(`Doma REST API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Set API key for authenticated requests
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.graphQLClient = new GraphQLClient(this.endpoint, {
      headers: this.getHeaders(),
      timeout: this.timeout,
    });
  }

  // Get current configuration
  getConfig(): DomaApiClientConfig {
    return {
      apiKey: this.apiKey || undefined,
      environment: this.environment,
      timeout: this.timeout,
    };
  }

  // Switch environment
  switchEnvironment(environment: 'testnet' | 'mainnet'): void {
    this.environment = environment;
    this.endpoint = DOMA_CONFIG[environment].graphqlEndpoint;
    this.restEndpoint = DOMA_CONFIG[environment].restEndpoint;
    
    this.graphQLClient = new GraphQLClient(this.endpoint, {
      headers: this.getHeaders(),
      timeout: this.timeout,
    });
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.query(`
        query HealthCheck {
          __schema {
            types {
              name
            }
          }
        }
      `);
      return true;
    } catch (error) {
      console.error('Doma API Health Check Failed:', error);
      return false;
    }
  }
}

// Default instance
export const domaApiClient = new DomaApiClient();

// Factory function for creating instances
export const createDomaApiClient = (config?: DomaApiClientConfig): DomaApiClient => {
  return new DomaApiClient(config);
};
