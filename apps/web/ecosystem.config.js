module.exports = {
  apps: [
    {
      name: "web",
      script: "npm",
      args: "start -- -p 3500",
      cwd: "/home/web/htdocs/ajarsyria.com/ajar-app/apps/web",
      env: {
        NODE_ENV: "production",
        NEXT_PUBLIC_API_URL: "https://backend.ajarsyria.com"
      }
    }
  ]
}
