/**
 * @file test_decode.c
 * @brief Unit tests for TriCore instruction decoder
 */

#include "unity.h"
#include "tricore_decode.h"

void setUp(void) {}
void tearDown(void) {}

/* ==========================================================================
 * 16-bit Instruction Tests
 * ========================================================================== */

void test_decode_16bit_ret(void)
{
    decoded_insn_t insn;
    int size = tricore_decode(0x80000000, 0x00000000, &insn);

    TEST_ASSERT_EQUAL(2, size);
    TEST_ASSERT_EQUAL(FMT_SR, insn.format);
}

void test_decode_16bit_mov(void)
{
    decoded_insn_t insn;
    int size = tricore_decode(0x80000000, 0x00001002, &insn);  /* MOV D[0], D[1] */

    TEST_ASSERT_EQUAL(2, size);
    TEST_ASSERT_EQUAL(FMT_SRR, insn.format);
    TEST_ASSERT_EQUAL(0, insn.dst);
    TEST_ASSERT_EQUAL(1, insn.src2);
}

void test_decode_16bit_add(void)
{
    decoded_insn_t insn;
    int size = tricore_decode(0x80000000, 0x00002142, &insn);  /* ADD D[1], D[2] */

    TEST_ASSERT_EQUAL(2, size);
    TEST_ASSERT_EQUAL(FMT_SRR, insn.format);
    TEST_ASSERT_EQUAL(1, insn.dst);
}

void test_decode_16bit_j(void)
{
    decoded_insn_t insn;
    int size = tricore_decode(0x80000000, 0x0000103C, &insn);  /* J disp8 */

    TEST_ASSERT_EQUAL(2, size);
    TEST_ASSERT_EQUAL(FMT_SB, insn.format);
}

void test_decode_16bit_ld_w(void)
{
    decoded_insn_t insn;
    int size = tricore_decode(0x80000000, 0x00000054, &insn);  /* LD.W D[0], [A15] */

    TEST_ASSERT_EQUAL(2, size);
    TEST_ASSERT_EQUAL(FMT_SLR, insn.format);
}

/* ==========================================================================
 * 32-bit Instruction Tests
 * ========================================================================== */

void test_decode_32bit_j(void)
{
    decoded_insn_t insn;
    int size = tricore_decode(0x80000000, 0x0000001D, &insn);  /* J disp24 */

    TEST_ASSERT_EQUAL(4, size);
    TEST_ASSERT_EQUAL(FMT_B, insn.format);
}

void test_decode_32bit_call(void)
{
    decoded_insn_t insn;
    int size = tricore_decode(0x80000000, 0x0000006D, &insn);  /* CALL disp24 */

    TEST_ASSERT_EQUAL(4, size);
    TEST_ASSERT_EQUAL(FMT_B, insn.format);
}

void test_decode_32bit_ld_w(void)
{
    decoded_insn_t insn;
    int size = tricore_decode(0x80000000, 0x00000019, &insn);  /* LD.W base+off */

    TEST_ASSERT_EQUAL(4, size);
    TEST_ASSERT_EQUAL(FMT_BO, insn.format);
}

void test_decode_32bit_addi(void)
{
    decoded_insn_t insn;
    int size = tricore_decode(0x80000000, 0x0000001B, &insn);  /* ADDI */

    TEST_ASSERT_EQUAL(4, size);
    TEST_ASSERT_EQUAL(FMT_RLC, insn.format);
}

void test_decode_32bit_movh(void)
{
    decoded_insn_t insn;
    int size = tricore_decode(0x80000000, 0x0000007B, &insn);  /* MOVH */

    TEST_ASSERT_EQUAL(4, size);
    TEST_ASSERT_EQUAL(FMT_RLC, insn.format);
}

void test_decode_32bit_lea(void)
{
    decoded_insn_t insn;
    int size = tricore_decode(0x80000000, 0x000000D9, &insn);  /* LEA */

    TEST_ASSERT_EQUAL(4, size);
    TEST_ASSERT_EQUAL(FMT_BOL, insn.format);
    TEST_ASSERT_TRUE(insn.is_addr_dst);
}

/* ==========================================================================
 * Disassembly Tests
 * ========================================================================== */

void test_mnemonic_ret(void)
{
    decoded_insn_t insn;
    tricore_decode(0x80000000, 0x00000000, &insn);

    TEST_ASSERT_EQUAL_STRING("RET", tricore_mnemonic(&insn));
}

void test_mnemonic_call(void)
{
    decoded_insn_t insn;
    tricore_decode(0x80000000, 0x0000006D, &insn);

    TEST_ASSERT_EQUAL_STRING("CALL", tricore_mnemonic(&insn));
}

/* ==========================================================================
 * Test Runner
 * ========================================================================== */

int main(void)
{
    UNITY_BEGIN();

    /* 16-bit tests */
    RUN_TEST(test_decode_16bit_ret);
    RUN_TEST(test_decode_16bit_mov);
    RUN_TEST(test_decode_16bit_add);
    RUN_TEST(test_decode_16bit_j);
    RUN_TEST(test_decode_16bit_ld_w);

    /* 32-bit tests */
    RUN_TEST(test_decode_32bit_j);
    RUN_TEST(test_decode_32bit_call);
    RUN_TEST(test_decode_32bit_ld_w);
    RUN_TEST(test_decode_32bit_addi);
    RUN_TEST(test_decode_32bit_movh);
    RUN_TEST(test_decode_32bit_lea);

    /* Disassembly tests */
    RUN_TEST(test_mnemonic_ret);
    RUN_TEST(test_mnemonic_call);

    return UNITY_END();
}
