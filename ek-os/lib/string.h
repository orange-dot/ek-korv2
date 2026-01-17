/**
 * @file string.h
 * @brief Minimal string/memory functions for EK-OS
 */

#ifndef EK_OS_STRING_H
#define EK_OS_STRING_H

#include <stdint.h>
#include <stddef.h>

void *memcpy(void *dest, const void *src, size_t n);
void *memset(void *s, int c, size_t n);
void *memmove(void *dest, const void *src, size_t n);
int memcmp(const void *s1, const void *s2, size_t n);
size_t strlen(const char *s);
char *strcpy(char *dest, const char *src);
int strcmp(const char *s1, const char *s2);

#endif /* EK_OS_STRING_H */
