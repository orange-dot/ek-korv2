/**
 * @file vadc.h
 * @brief TC397XP Versatile ADC (VADC/EVADC) Interface
 *
 * The VADC provides fast 12-bit SAR ADC conversion:
 * - 12 ADC groups (G0-G11)
 * - 8 channels per group
 * - Request sources for triggered conversion
 * - Background scan for continuous monitoring
 *
 * Critical for DC-DC converter:
 * - Voltage sensing (input, output, intermediate)
 * - Current measurement (complementary to DSADC)
 * - Temperature monitoring
 */

#ifndef VADC_H
#define VADC_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * VADC Base Address and Size
 * ========================================================================== */

#define VADC_BASE_ADDR          0xF0020000
#define VADC_SIZE               0x4000

/* ==========================================================================
 * VADC Global Registers
 * ========================================================================== */

#define VADC_CLC                0x0000      /* Clock Control */
#define VADC_ID                 0x0008      /* Module ID */
#define VADC_OCS                0x0028      /* OCDS Control */
#define VADC_GLOBCFG            0x0080      /* Global Configuration */
#define VADC_GLOBICLASS0        0x00A0      /* Input Class 0 */
#define VADC_GLOBICLASS1        0x00A4      /* Input Class 1 */
#define VADC_GLOBBOUND          0x00B8      /* Global Boundary */
#define VADC_GLOBEFLAG          0x00E0      /* Global Event Flag */
#define VADC_GLOBEVNP           0x0140      /* Global Event Node Pointer */
#define VADC_GLOBTF             0x0160      /* Global Test Functions */
#define VADC_BRSSEL0            0x0180      /* Background Scan Source Select 0 */
#define VADC_BRSSEL1            0x0184      /* Background Scan Source Select 1 */
#define VADC_BRSSEL2            0x0188      /* Background Scan Source Select 2 */
#define VADC_BRSSEL3            0x018C      /* Background Scan Source Select 3 */
#define VADC_BRSPND0            0x01C0      /* Background Scan Pending 0 */
#define VADC_BRSPND1            0x01C4      /* Background Scan Pending 1 */
#define VADC_BRSPND2            0x01C8      /* Background Scan Pending 2 */
#define VADC_BRSPND3            0x01CC      /* Background Scan Pending 3 */
#define VADC_BRSCTRL            0x0200      /* Background Scan Control */
#define VADC_BRSMR              0x0204      /* Background Scan Mode */
#define VADC_GLOBRCR            0x0280      /* Global Result Control */
#define VADC_GLOBRES            0x0300      /* Global Result */
#define VADC_GLOBRESD           0x0380      /* Global Result Debug */

/* ==========================================================================
 * VADC Group Registers (per group)
 * ========================================================================== */

#define VADC_G0_BASE            0x0400      /* Group 0 base */
#define VADC_GROUP_SPACING      0x0400      /* Between groups */
#define VADC_GROUP_COUNT        12
#define VADC_CH_PER_GROUP       8

/* Group Register Offsets (from group base) */
#define VADC_G_ARBCFG           0x00        /* Arbitration Configuration */
#define VADC_G_ARBPR            0x04        /* Arbitration Priority */
#define VADC_G_CHASS            0x08        /* Channel Assignment */
#define VADC_G_RRASS            0x0C        /* Result Register Assignment */
#define VADC_G_ICLASS0          0x20        /* Input Class 0 */
#define VADC_G_ICLASS1          0x24        /* Input Class 1 */
#define VADC_G_ALIAS            0x28        /* Alias Register */
#define VADC_G_BOUND            0x30        /* Boundary Select */
#define VADC_G_SYNCTR           0x38        /* Sync Control */
#define VADC_G_BFL              0x40        /* Boundary Flag */
#define VADC_G_BFLS             0x44        /* Boundary Flag Software Control */
#define VADC_G_BFLC             0x48        /* Boundary Flag Control */
#define VADC_G_BFLNP            0x4C        /* Boundary Flag Node Pointer */
#define VADC_G_QCTRL0           0x60        /* Queue 0 Source Control */
#define VADC_G_QMR0             0x64        /* Queue 0 Mode */
#define VADC_G_QSR0             0x68        /* Queue 0 Status */
#define VADC_G_Q0R0             0x6C        /* Queue 0 Register 0 */
#define VADC_G_QBUR0            0x70        /* Queue 0 Backup */
#define VADC_G_ASCTRL           0x80        /* Auto-scan Source Control */
#define VADC_G_ASMR             0x84        /* Auto-scan Mode */
#define VADC_G_ASSEL            0x88        /* Auto-scan Channel Select */
#define VADC_G_ASPND            0x8C        /* Auto-scan Pending */
#define VADC_G_CEFLAG           0xE0        /* Channel Event Flag */
#define VADC_G_REFLAG           0xE4        /* Result Event Flag */
#define VADC_G_SEFLAG           0xE8        /* Source Event Flag */
#define VADC_G_CEFCLR           0x100       /* Channel Event Flag Clear */
#define VADC_G_REFCLR           0x104       /* Result Event Flag Clear */
#define VADC_G_SEFCLR           0x108       /* Source Event Flag Clear */
#define VADC_G_CEVNP0           0x120       /* Channel Event Node Ptr 0 */
#define VADC_G_REVNP0           0x140       /* Result Event Node Ptr 0 */
#define VADC_G_REVNP1           0x144       /* Result Event Node Ptr 1 */
#define VADC_G_SEVNP            0x150       /* Source Event Node Ptr */
#define VADC_G_SRACT            0x158       /* Service Request SW Activation */
#define VADC_G_EMUXCTR          0x1A0       /* Ext Mux Control */
#define VADC_G_VFR              0x1B8       /* Valid Flag */
#define VADC_G_CHCTR0           0x200       /* Channel 0 Control */
/* CH1-7: +0x04 each */
#define VADC_G_RCR0             0x280       /* Result Control 0 */
/* RCR1-15: +0x04 each */
#define VADC_G_RES0             0x300       /* Result Register 0 */
/* RES1-15: +0x04 each */
#define VADC_G_RESD0            0x380       /* Result Debug 0 */
/* RESD1-15: +0x04 each */

/* ==========================================================================
 * VADC Register Bit Definitions
 * ========================================================================== */

/* GLOBCFG bits */
#define GLOBCFG_DIVA_MASK       0x0000001F  /* [4:0] Analog clock divider */
#define GLOBCFG_DCMSB           (1U << 7)   /* [7] Double clock MSB */
#define GLOBCFG_DIVD_MASK       0x00000300  /* [9:8] Digital clock divider */
#define GLOBCFG_DIVWC           (1U << 15)  /* [15] Write control */
#define GLOBCFG_DPCAL0          (1U << 16)  /* [16] Disable post-cal G0 */
/* DPCAL1-11: bits 17-27 */
#define GLOBCFG_SUCAL           (1U << 31)  /* [31] Start-up calibration */

/* G_ARBCFG bits */
#define ARBCFG_ANONC_MASK       0x00000003  /* [1:0] Analog converter control */
#define ARBCFG_ARBRND_MASK      0x00000030  /* [5:4] Arbitration round */
#define ARBCFG_ARBM             (1U << 7)   /* [7] Arbitration mode */
#define ARBCFG_ANONS_MASK       0x00000300  /* [9:8] Analog conv status */
#define ARBCFG_CSRC_MASK        0x00030000  /* [17:16] Conv start source */
#define ARBCFG_CHNR_MASK        0x001C0000  /* [20:18] Current channel */
#define ARBCFG_SYNRUN           (1U << 21)  /* [21] Sync conversion running */
#define ARBCFG_CAL              (1U << 28)  /* [28] Calibration active */
#define ARBCFG_BUSY             (1U << 30)  /* [30] Converter busy */
#define ARBCFG_SAMPLE           (1U << 31)  /* [31] Sample phase */

/* G_ARBPR bits */
#define ARBPR_PRIO0_MASK        0x00000003  /* [1:0] Priority request source 0 */
#define ARBPR_CSM0              (1U << 3)   /* [3] Cancel/wait mode RS0 */
#define ARBPR_PRIO1_MASK        0x00000030  /* [5:4] Priority request source 1 */
#define ARBPR_CSM1              (1U << 7)   /* [7] Cancel/wait mode RS1 */
#define ARBPR_PRIO2_MASK        0x00000300  /* [9:8] Priority request source 2 */
#define ARBPR_CSM2              (1U << 11)  /* [11] Cancel/wait mode RS2 */
#define ARBPR_ASEN0             (1U << 24)  /* [24] Arb slot 0 enable */
#define ARBPR_ASEN1             (1U << 25)  /* [25] Arb slot 1 enable */
#define ARBPR_ASEN2             (1U << 26)  /* [26] Arb slot 2 enable */

/* G_CHCTRx bits */
#define CHCTR_ICLSEL_MASK       0x00000003  /* [1:0] Input class select */
#define CHCTR_BNDSELL_MASK      0x00000030  /* [5:4] Lower boundary select */
#define CHCTR_BNDSELU_MASK      0x000000C0  /* [7:6] Upper boundary select */
#define CHCTR_CHEVMODE_MASK     0x00000300  /* [9:8] Channel event mode */
#define CHCTR_SYNC              (1U << 10)  /* [10] Sync request */
#define CHCTR_REFSEL            (1U << 11)  /* [11] Reference select */
#define CHCTR_BNDSELX_MASK      0x0000F000  /* [15:12] Extended boundary */
#define CHCTR_RESREG_MASK       0x000F0000  /* [19:16] Result register */
#define CHCTR_RESTGT            (1U << 20)  /* [20] Result target */
#define CHCTR_RESPOS            (1U << 21)  /* [21] Result position */
#define CHCTR_BWDCH_MASK        0x00C00000  /* [23:22] Broken wire detect */
#define CHCTR_BWDEN             (1U << 30)  /* [30] Broken wire enable */

/* G_RCRx bits */
#define RCR_DRCTR_MASK          0x0000000F  /* [3:0] Data reduction control */
#define RCR_DMM_MASK            0x00000030  /* [5:4] Data modification mode */
#define RCR_WFR                 (1U << 6)   /* [6] Wait for read */
#define RCR_FEN_MASK            0x00000300  /* [9:8] FIFO enable */
#define RCR_SRGEN               (1U << 31)  /* [31] Service req generation */

/* G_RESx bits */
#define RES_RESULT_MASK         0x0000FFFF  /* [15:0] Conversion result */
#define RES_DRC_MASK            0x000F0000  /* [19:16] Data reduction counter */
#define RES_CHNR_MASK           0x01F00000  /* [24:20] Channel number */
#define RES_EMUX_MASK           0x0E000000  /* [27:25] External mux value */
#define RES_CRS                 (1U << 28)  /* [28] Converted req source */
#define RES_FCR                 (1U << 29)  /* [29] Fast compare result */
#define RES_VF                  (1U << 31)  /* [31] Valid flag */

/* G_QCTRLx bits */
#define QCTRL_SRCRESREG_MASK    0x0000000F  /* [3:0] Source result reg */
#define QCTRL_TRSEL_MASK        0x000000F0  /* [7:4] Trigger select */
#define QCTRL_XTSEL_MASK        0x00000F00  /* [11:8] Ext trigger select */
#define QCTRL_XTLVL             (1U << 12)  /* [12] Ext trigger level */
#define QCTRL_XTMODE_MASK       0x00006000  /* [14:13] Ext trigger mode */
#define QCTRL_XTWC              (1U << 15)  /* [15] Write control ext trig */
#define QCTRL_GTSEL_MASK        0x000F0000  /* [19:16] Gate select */
#define QCTRL_GTLVL             (1U << 20)  /* [20] Gate level */
#define QCTRL_GTWC              (1U << 23)  /* [23] Write control gate */
#define QCTRL_TMEN              (1U << 28)  /* [28] Timer mode enable */
#define QCTRL_TMWC              (1U << 31)  /* [31] Write control timer */

/* G_QMRx bits */
#define QMR_ENGT                (1U << 0)   /* [0] Enable gate */
#define QMR_ENTR                (1U << 2)   /* [2] Enable trigger */
#define QMR_CLRV                (1U << 8)   /* [8] Clear valid */
#define QMR_TREV                (1U << 9)   /* [9] Trigger event */
#define QMR_FLUSH               (1U << 10)  /* [10] Flush queue */
#define QMR_CEV                 (1U << 11)  /* [11] Clear event */
#define QMR_RPTDIS              (1U << 16)  /* [16] Repeat disable */

/* ==========================================================================
 * VADC Types
 * ========================================================================== */

/* ADC channel state */
typedef struct {
    uint32_t chctr;         /* Channel control */
    uint16_t value;         /* Simulated analog value (0-4095) */
    bool pending;           /* Conversion pending */
} vadc_channel_t;

/* ADC result register */
typedef struct {
    uint32_t rcr;           /* Result control */
    uint32_t res;           /* Result register */
    bool valid;             /* Valid flag */
} vadc_result_t;

/* ADC group state */
typedef struct {
    uint32_t arbcfg;        /* Arbitration config */
    uint32_t arbpr;         /* Arbitration priority */
    uint32_t iclass[2];     /* Input class 0, 1 */
    uint32_t qctrl[3];      /* Queue control */
    uint32_t qmr[3];        /* Queue mode */
    uint32_t asmr;          /* Autoscan mode */
    uint32_t assel;         /* Autoscan select */
    uint32_t ceflag;        /* Channel event flag */
    uint32_t reflag;        /* Result event flag */
    uint32_t seflag;        /* Source event flag */
    uint32_t vfr;           /* Valid flag register */

    vadc_channel_t ch[VADC_CH_PER_GROUP];   /* Channels */
    vadc_result_t result[16];               /* Result registers */

    bool busy;              /* Conversion busy */
    int current_ch;         /* Current channel being converted */
    uint32_t conv_cycles;   /* Conversion cycles remaining */
} vadc_group_t;

/* VADC module state */
typedef struct vadc {
    /* Global registers */
    uint32_t clc;
    uint32_t id;
    uint32_t globcfg;
    uint32_t globiclass[2];
    uint32_t globbound;
    uint32_t globeflag;
    uint32_t globevnp;
    uint32_t brsctrl;
    uint32_t brsmr;
    uint32_t brssel[4];
    uint32_t brspnd[4];
    uint32_t globrcr;
    uint32_t globres;

    /* Groups */
    vadc_group_t group[VADC_GROUP_COUNT];

    /* Clock configuration */
    uint32_t adc_freq_hz;       /* ADC clock frequency */
    uint32_t sample_cycles;     /* Sample time in cycles */
    uint32_t conv_cycles;       /* Conversion time in cycles */

    /* Callbacks for analog input */
    uint16_t (*get_analog)(int group, int channel, void *user);
    void *user_data;

} vadc_t;

/* ==========================================================================
 * VADC Functions
 * ========================================================================== */

vadc_t* vadc_create(uint32_t freq_hz);
void vadc_destroy(vadc_t *vadc);
void vadc_reset(vadc_t *vadc);
void vadc_tick(vadc_t *vadc, uint32_t cycles);

uint32_t vadc_read_reg(vadc_t *vadc, uint32_t offset);
void vadc_write_reg(vadc_t *vadc, uint32_t offset, uint32_t value);

/* Set simulated analog value for a channel */
void vadc_set_channel_value(vadc_t *vadc, int group, int channel, uint16_t value);

/* Trigger conversion */
void vadc_trigger_queue(vadc_t *vadc, int group, int queue);
void vadc_trigger_scan(vadc_t *vadc, int group);
void vadc_trigger_background(vadc_t *vadc);

/* Get conversion result */
uint16_t vadc_get_result(vadc_t *vadc, int group, int result_reg, bool *valid);

/* Check for pending interrupts */
bool vadc_irq_pending(vadc_t *vadc, int group, int source);

/* Set analog input callback */
void vadc_set_analog_callback(vadc_t *vadc,
    uint16_t (*callback)(int group, int channel, void *user), void *user);

#ifdef __cplusplus
}
#endif

#endif /* VADC_H */
