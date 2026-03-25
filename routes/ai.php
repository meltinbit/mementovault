<?php

use App\Mcp\Servers\ContextVaultServer;
use Laravel\Mcp\Facades\Mcp;

Mcp::web('/mcp', ContextVaultServer::class)
    ->middleware('auth.mcp');
