# Market Processor

Consumes `viralmint:market-signals` from Redis Streams and persists normalized market snapshots into PostgreSQL through `@viralmint/db`.

The consumer uses a Redis consumer group so additional processors can be added later without duplicating each message across every worker.

This service only stores market observations. It does not execute trades, deploy tokens, sign transactions, or provide investment advice.
