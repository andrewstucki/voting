var config = {
  src: "client",
  dest: "public",
  bower: "bower_components"
};

module.exports = function(grunt) {
  grunt.initConfig({
    config: config,
    eslint: {
      files: [
        'Gruntfile.js',
        'server/**/*.js',
        'test/server/**/*.js'
      ]
    },

    bump: {
      options: {
        files: ['package.json'],
        commit: false,
        createTag: false,
        push: false,
      }
    },

    browserify: {
      app: {
        options: {
          transform: [
            ["babelify", {
              "presets": ["es2015", "react", "stage-0"]
            }],
            "envify"
          ]
        },
        files: {
          '<%= config.dest %>/assets/scripts/app.js': '<%= config.src %>/script/app.js'
        }
      }
    },

    less: {
      default: {
        files: {
          '<%= config.dest %>/assets/styles/app.css': '<%= config.src %>/less/app.less'
        },
        options: {
          paths: [config.bower, '<%= config.src %>/less']
        }
      },
      release: {
        files: {
          '<%= config.dest %>/assets/styles/app.css': '<%= config.src %>/less/app.less'
        },
        options: {
          compress: true,
          paths: [config.bower, '<%= config.src %>/less']
        }
      }
    },

    copy: {
      app: {
        files: {
          '<%= config.dest %>/index.html': '<%= config.src %>/index.html'
        }
      },
      fonts: {
        files: [{
          expand: true,
          cwd: '<%= config.bower %>/bootstrap/fonts',
          src: ['**'],
          dest: '<%= config.dest %>/assets/fonts'
        }, {
          expand: true,
          cwd: '<%= config.bower %>/font-awesome/fonts',
          src: ['**'],
          dest: '<%= config.dest %>/assets/fonts'
        }]
      }
    },

    uglify: {
      app: {
        files: {
          '<%= config.dest %>/assets/scripts/app.js': ['<%= config.dest %>/assets/scripts/app.js']
        }
      }
    },

    watch: {
      options: {
        livereload: true,
      },
      scripts: {
        files: ['<%= config.src %>/**/*.js'],
        tasks: ['browserify'],
      },
      styles: {
        files: ['<%= config.src %>/**/*.less'],
        tasks: ['less:default']
      }
    },
  });

  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('production', 'Set production environment variables', function() {
    process.env.NODE_ENV = 'production';
  });

  grunt.registerTask('core', [
    'eslint',
    'browserify',
    'copy'
  ]);

  grunt.registerTask('release', [
    'production',
    'core',
    'less:release',
    'uglify'
  ]);

  grunt.registerTask('default', [
    'core',
    'less:default',
    'watch'
  ]);
};
