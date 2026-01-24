#----------------------------------------------------------------
# Generated CMake target import file for configuration "Release".
#----------------------------------------------------------------

# Commands may need to know the format version.
set(CMAKE_IMPORT_FILE_VERSION 1)

# Import target "ekk::ekk" for configuration "Release"
set_property(TARGET ekk::ekk APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(ekk::ekk PROPERTIES
  IMPORTED_LINK_INTERFACE_LANGUAGES_RELEASE "C"
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/lib/libekk.a"
  )

list(APPEND _IMPORT_CHECK_TARGETS ekk::ekk )
list(APPEND _IMPORT_CHECK_FILES_FOR_ekk::ekk "${_IMPORT_PREFIX}/lib/libekk.a" )

# Commands beyond this point should not need to know the version.
set(CMAKE_IMPORT_FILE_VERSION)
