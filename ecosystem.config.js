module.exports = {
    apps : [{
      name: "daman",
      script: "./start.sh",
      watch: true,
      ignore_watch : ["node_modules"],
      watch_options: {
        followSymlinks: false
      }
    }]
  };
  