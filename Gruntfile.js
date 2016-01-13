var config = {
  src: "client",
  dest: "public",
  bower: "bower_components"
};

module.exports = function(grunt) {
  grunt.initConfig({
    config: config,
    jshint: {
      files: [
        'Gruntfile.js',
        'server/**/*.js',
        'client/**/*.js',
        'test/**/*.js'
      ],
      options: {
        globals: {
          jQuery: true
        }
      }
    },

    browserify: {
      app: {
        files: {
          '<%= config.dest %>/assets/scripts/base-app.js': '<%= config.src %>/script/app.js'
        }
      }
    },

    concat: {
      scripts: {
        files: {
          '<%= config.dest %>/assets/scripts/app.js': [
            '<%= config.bower %>/jquery/dist/jquery.js',
            '<%= config.dest %>/assets/scripts/base-app.js'
          ]
        }
      }
    },

    less: {
      app: {
        files: {
          '<%= config.dest %>/assets/styles/app.css': '<%= config.src %>/less/app.less'
        },
        options: {
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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('default', [
    'jshint',
    'browserify',
    'less',
    'copy',
    'concat'
  ]);

};
