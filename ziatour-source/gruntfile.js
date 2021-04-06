module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      dist: {
        options: {
					sourcemap: 'none',
          style: 'expanded',
					precision: 2,
					quiet: true
        },
        files: [{
          expand: true,
          cwd: 'src/scss/',
          src: ['**/*.scss'],
          dest: '../ziatour/lib/css/',
          ext: '.css'
      	}]
      },
      distMin: {
        options: {
					sourcemap: 'none',
          style: 'compressed',
					precision: 2,
					quiet: true
        },
        files: [{
          expand: true,
          cwd: 'src/scss/',
          src: ['**/*.scss'],
          dest: '../ziatour/lib/css/',
          ext: '.min.css'
      	}]
      }
    },
    uglify: {
      dist: {
      	options: {
        	mangle: false,
					beautify: true
				},
        files: [{
        	expand: true,
        	src: ['src/js/*.js'],
        	dest: '../ziatour/lib/js/',
        	cwd: '.',
        	rename: function (dst, src) {
        		return dst + '/' + src.split('/').pop();
        	}
        }]
      },
      distMin: {
      	options: {
        	mangle: false
				},
        files: [{
        	expand: true,
        	src: ['src/js/*.js'],
        	dest: '../ziatour/lib/js/',
        	cwd: '.',
        	rename: function (dst, src) {
        		return dst + '/' + src.split('/').pop().replace('.js', '.min.js');
        	}
        }]
      },
    },
    minifyHtml: {
			dist: {
				options: {
					removeComments: true,
					collapseWhitespace: true,
					removeAttributeQuotes: true,
					useShortDoctype: true,
					continueOnParseError: true
				},
        files: [{
        	expand: true,
        	src: ['*.htm','*.html'],
        	dest: 'dist/htm/',
        	dest: '../ziatour/html/',
        	cwd: 'src/htm/'
        }]
			}
		},
		git: {
			task: {
				options: {
					cwd: "src",
				},
				files: {
					src: ['src/**'],
				}
			}
		},
    watch: {
      sass: {
        tasks: ['sass'],
        files: ['**/*.scss']
      },
      js: {
        tasks: ['uglify'],
        files: ['**/*.js']
      },
      htm: {
        tasks: ['minifyHtml'],
        files: '**/*.htm'
			}
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-minify-html');
  grunt.loadNpmTasks('grunt-git');
  grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['watch']);

};