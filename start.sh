#!/usr/bin/env bash
set -euo pipefail

cd backend
npm ci --omit=dev || npm ci
npm run start
