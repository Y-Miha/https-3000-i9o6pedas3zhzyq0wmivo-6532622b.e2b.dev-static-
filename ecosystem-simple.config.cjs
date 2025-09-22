module.exports = {
  apps: [
    {
      name: 'crm-server',
      script: 'server.cjs',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}