<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="icon" type="image/png" href="/favicon.png">
        <link rel="icon" type="image/x-icon" href="/favicon.ico">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=dm-sans:400,500,600,700|jetbrains-mono:400,500" rel="stylesheet" />

        <meta name="description" content="Your AI brain, centralized. Organize identity, context, skills, and assets in one place. Serve them to any AI client via MCP." />
        <meta property="og:title" content="{{ config('app.name', 'Memento Vault') }} — Your AI brain, centralized" />
        <meta property="og:description" content="Organize identity, context, skills, and assets in one place. Serve them to any AI client via MCP." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="{{ config('app.url') }}" />
        <meta property="og:image" content="{{ config('app.url') }}/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="{{ config('app.name', 'Memento Vault') }}" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="{{ config('app.name', 'Memento Vault') }} — Your AI brain, centralized" />
        <meta name="twitter:description" content="Organize identity, context, skills, and assets in one place. Serve them to any AI client via MCP." />
        <meta name="twitter:image" content="{{ config('app.url') }}/og-image.png" />

        @production
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-DKYLTJ7QQK"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DKYLTJ7QQK');
        </script>
        @endproduction

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
