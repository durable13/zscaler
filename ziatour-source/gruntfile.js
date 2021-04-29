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
        	compress: false,
					preserveComments: 'all',
					beautify: {
						beautify: true
					}
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
    watch: {
      sass: {
        tasks: ['sass'],
        files: ['**/*.scss']
      },
      js: {
        tasks: ['uglify'],
        files: ['**/*.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['watch']);

};