module.exports = {
  apps: [
    {
      name: 'hrms',
      script: 'npm',
      args: 'run preview',
      interpreter: 'none',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      env_file: '.env',
      max_memory_restart: '500M',
      merge_logs: true,
      time: true,
      autorestart: true,
      watch: false,
    },
  ],
};
