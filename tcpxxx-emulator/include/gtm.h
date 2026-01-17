/**
 * @file gtm.h
 * @brief TC397XP Generic Timer Module (GTM) Interface
 *
 * The GTM provides comprehensive timer functionality for:
 * - PWM generation (TOM, ATOM)
 * - Input capture (TIM)
 * - Multi-Channel Sequencer (MCS)
 * - Time Base Unit (TBU)
 * - Digital PLL (DPLL)
 *
 * Critical for DC-DC converter control:
 * - Phase-shifted PWM for DAB/PSFB topologies
 * - Dead-time insertion
 * - ADC trigger generation
 * - Synchronous rectification timing
 */

#ifndef GTM_H
#define GTM_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * GTM Base Address and Size
 * ========================================================================== */

#define GTM_BASE_ADDR           0xF0100000
#define GTM_SIZE                0x80000     /* 512KB */

/* ==========================================================================
 * GTM Global Registers
 * ========================================================================== */

#define GTM_REV                 0x0000      /* GTM Revision */
#define GTM_RST                 0x0004      /* GTM Reset */
#define GTM_CTRL                0x0008      /* GTM Control */
#define GTM_AEI_ADDR_XPT        0x000C      /* AEI Address */
#define GTM_IRQ_NOTIFY          0x0010      /* Interrupt Notification */
#define GTM_IRQ_EN              0x0014      /* Interrupt Enable */
#define GTM_IRQ_FORCINT         0x0018      /* Force Interrupt */
#define GTM_IRQ_MODE            0x001C      /* Interrupt Mode */
#define GTM_EIRQ_EN             0x0020      /* Error Interrupt Enable */
#define GTM_HW_CONF             0x0024      /* HW Configuration (RO) */
#define GTM_BRIDGE_MODE         0x0028      /* Bridge Mode */
#define GTM_BRIDGE_PTR1         0x002C      /* Bridge Pointer 1 */
#define GTM_BRIDGE_PTR2         0x0030      /* Bridge Pointer 2 */
#define GTM_TIM_AUX_IN_SRC      0x0038      /* TIM Aux Input Source */
#define GTM_EXT_CAP_EN          0x003C      /* External Capture Enable */
#define GTM_CMP_EN              0x0040      /* Compare Enable */
#define GTM_CMP_IRQ_EN          0x0044      /* Compare Interrupt Enable */
#define GTM_CMP_IRQ_FORCINT     0x0048      /* Force Compare Interrupt */
#define GTM_CMP_IRQ_MODE        0x004C      /* Compare Interrupt Mode */
#define GTM_CMP_EIRQ_EN         0x0050      /* Compare Error IRQ Enable */

/* ==========================================================================
 * TBU (Time Base Unit) - 3 channels
 * ========================================================================== */

#define GTM_TBU_BASE            (GTM_BASE_ADDR + 0x0100)
#define GTM_TBU_SIZE            0x40

/* TBU Register Offsets */
#define GTM_TBU_CHEN            0x00        /* Channel Enable */
#define GTM_TBU_CH0_CTRL        0x04        /* Channel 0 Control */
#define GTM_TBU_CH0_BASE        0x08        /* Channel 0 Base */
#define GTM_TBU_CH1_CTRL        0x0C        /* Channel 1 Control */
#define GTM_TBU_CH1_BASE        0x10        /* Channel 1 Base */
#define GTM_TBU_CH2_CTRL        0x14        /* Channel 2 Control */
#define GTM_TBU_CH2_BASE        0x18        /* Channel 2 Base */

/* TBU_CHx_CTRL bits */
#define TBU_CH_CTRL_LOW_RES     (1U << 0)   /* Low Resolution Mode */
#define TBU_CH_CTRL_CH_CLK_SRC  0x00000006  /* Clock Source [2:1] */

/* ==========================================================================
 * TIM (Timer Input Module) - 8 modules, 8 channels each
 * ========================================================================== */

#define GTM_TIM0_BASE           (GTM_BASE_ADDR + 0x1000)
#define GTM_TIM_SPACING         0x0800      /* Between TIM modules */
#define GTM_TIM_CH_SPACING      0x80        /* Between channels */
#define GTM_TIM_CH_COUNT        8           /* Channels per module */
#define GTM_TIM_MODULE_COUNT    8

/* TIM Channel Register Offsets */
#define GTM_TIM_CH_GPR0         0x00        /* General Purpose Reg 0 */
#define GTM_TIM_CH_GPR1         0x04        /* General Purpose Reg 1 */
#define GTM_TIM_CH_CNT          0x08        /* Counter */
#define GTM_TIM_CH_ECNT         0x0C        /* Edge Counter */
#define GTM_TIM_CH_CNTS         0x10        /* Shadow Counter */
#define GTM_TIM_CH_TDUC         0x14        /* TDU Counter */
#define GTM_TIM_CH_FLT_RE       0x18        /* Filter Rising Edge */
#define GTM_TIM_CH_FLT_FE       0x1C        /* Filter Falling Edge */
#define GTM_TIM_CH_CTRL         0x20        /* Channel Control */
#define GTM_TIM_CH_ECTRL        0x24        /* Extended Control */
#define GTM_TIM_CH_IRQ_NOTIFY   0x28        /* IRQ Notification */
#define GTM_TIM_CH_IRQ_EN       0x2C        /* IRQ Enable */
#define GTM_TIM_CH_IRQ_FORCINT  0x30        /* Force Interrupt */
#define GTM_TIM_CH_IRQ_MODE     0x34        /* IRQ Mode */
#define GTM_TIM_CH_EIRQ_EN      0x38        /* Error IRQ Enable */

/* TIM_CHx_CTRL bits */
#define TIM_CTRL_TIM_EN         (1U << 0)   /* Enable channel */
#define TIM_CTRL_TIM_MODE_MASK  0x0000000E  /* Mode [3:1] */
#define TIM_CTRL_OSM            (1U << 4)   /* One-shot mode */
#define TIM_CTRL_ARU_EN         (1U << 5)   /* ARU enable */
#define TIM_CTRL_CICTRL         (1U << 6)   /* CMU input clock */
#define TIM_CTRL_GPR0_SEL_MASK  0x00000300  /* GPR0 source [9:8] */
#define TIM_CTRL_GPR1_SEL_MASK  0x00000C00  /* GPR1 source [11:10] */
#define TIM_CTRL_CNTS_SEL_MASK  0x00003000  /* CNTS source [13:12] */
#define TIM_CTRL_DSL            (1U << 14)  /* DSL select */
#define TIM_CTRL_ISL            (1U << 15)  /* ISL select */
#define TIM_CTRL_ECNT_RESET     (1U << 16)  /* Edge counter reset */
#define TIM_CTRL_FLT_EN         (1U << 17)  /* Filter enable */
#define TIM_CTRL_FLT_CNT_FRQ    0x000C0000  /* Filter count freq [19:18] */
#define TIM_CTRL_EXT_CAP_EN     (1U << 20)  /* External capture enable */
#define TIM_CTRL_FLT_MODE_RE    (1U << 21)  /* Filter mode rising */
#define TIM_CTRL_FLT_CTR_RE     (1U << 22)  /* Filter counter rising */
#define TIM_CTRL_FLT_MODE_FE    (1U << 23)  /* Filter mode falling */
#define TIM_CTRL_FLT_CTR_FE     (1U << 24)  /* Filter counter falling */
#define TIM_CTRL_CLK_SEL_MASK   0x0E000000  /* Clock select [27:25] */
#define TIM_CTRL_FR_ECNT_OFL    (1U << 28)  /* Frame edge overflow */
#define TIM_CTRL_EGPR0_SEL      (1U << 29)  /* EGPR0 select */
#define TIM_CTRL_EGPR1_SEL      (1U << 30)  /* EGPR1 select */
#define TIM_CTRL_TOCTRL         (1U << 31)  /* Timeout control */

/* ==========================================================================
 * TOM (Timer Output Module) - 6 modules, 16 channels each
 * ========================================================================== */

#define GTM_TOM0_BASE           (GTM_BASE_ADDR + 0x8000)
#define GTM_TOM_SPACING         0x0800      /* Between TOM modules */
#define GTM_TOM_CH_SPACING      0x40        /* Between channels */
#define GTM_TOM_CH_COUNT        16          /* Channels per module */
#define GTM_TOM_MODULE_COUNT    6

/* TOM Global Registers (per module) */
#define GTM_TOM_TGC0_GLB_CTRL   0x30        /* TGC0 Global Control */
#define GTM_TOM_TGC0_ACT_TB     0x34        /* TGC0 Action Time Base */
#define GTM_TOM_TGC0_FUPD_CTRL  0x38        /* TGC0 Force Update Control */
#define GTM_TOM_TGC0_INT_TRIG   0x3C        /* TGC0 Internal Trigger */
#define GTM_TOM_TGC0_ENDIS_CTRL 0x70        /* TGC0 Enable/Disable Control */
#define GTM_TOM_TGC0_ENDIS_STAT 0x74        /* TGC0 Enable/Disable Status */
#define GTM_TOM_TGC0_OUTEN_CTRL 0x78        /* TGC0 Output Enable Control */
#define GTM_TOM_TGC0_OUTEN_STAT 0x7C        /* TGC0 Output Enable Status */
#define GTM_TOM_TGC1_GLB_CTRL   0x130       /* TGC1 Global Control */
#define GTM_TOM_TGC1_ACT_TB     0x134       /* TGC1 Action Time Base */
#define GTM_TOM_TGC1_FUPD_CTRL  0x138       /* TGC1 Force Update Control */
#define GTM_TOM_TGC1_INT_TRIG   0x13C       /* TGC1 Internal Trigger */
#define GTM_TOM_TGC1_ENDIS_CTRL 0x170       /* TGC1 Enable/Disable Control */
#define GTM_TOM_TGC1_ENDIS_STAT 0x174       /* TGC1 Enable/Disable Status */
#define GTM_TOM_TGC1_OUTEN_CTRL 0x178       /* TGC1 Output Enable Control */
#define GTM_TOM_TGC1_OUTEN_STAT 0x17C       /* TGC1 Output Enable Status */

/* TOM Channel Register Offsets */
#define GTM_TOM_CH_CTRL         0x00        /* Channel Control */
#define GTM_TOM_CH_SR0          0x04        /* Shadow Register 0 (CM0) */
#define GTM_TOM_CH_SR1          0x08        /* Shadow Register 1 (CM1) */
#define GTM_TOM_CH_CM0          0x0C        /* Compare Register 0 */
#define GTM_TOM_CH_CM1          0x10        /* Compare Register 1 */
#define GTM_TOM_CH_CN0          0x14        /* Counter Register */
#define GTM_TOM_CH_STAT         0x18        /* Status Register */
#define GTM_TOM_CH_IRQ_NOTIFY   0x1C        /* IRQ Notification */
#define GTM_TOM_CH_IRQ_EN       0x20        /* IRQ Enable */
#define GTM_TOM_CH_IRQ_FORCINT  0x24        /* Force Interrupt */
#define GTM_TOM_CH_IRQ_MODE     0x28        /* IRQ Mode */

/* TOM_CHx_CTRL bits */
#define TOM_CTRL_SL             (1U << 0)   /* Signal Level */
#define TOM_CTRL_CLK_SRC_SR     0x00000006  /* Clock Source [2:1] */
#define TOM_CTRL_OSM            (1U << 3)   /* One-shot mode */
#define TOM_CTRL_BITREV         (1U << 4)   /* Bit reverse */
#define TOM_CTRL_RST_CCU0       (1U << 5)   /* CCU0 reset source */
#define TOM_CTRL_RST_CCU1       (1U << 6)   /* CCU1 reset source */
#define TOM_CTRL_TRIGOUT        (1U << 7)   /* Trigger output select */
#define TOM_CTRL_FREEZE         (1U << 8)   /* Freeze counter */
#define TOM_CTRL_SPEM           (1U << 9)   /* SPE mode */
#define TOM_CTRL_GCM            0x00000C00  /* Gate counter mode [11:10] */
#define TOM_CTRL_OSM_TRIG       (1U << 12)  /* OSM trigger */
#define TOM_CTRL_EXT_TRIG       (1U << 13)  /* External trigger */
#define TOM_CTRL_EXTTRIGOUT_MASK 0x0000C000 /* Ext trigger out [15:14] */
#define TOM_CTRL_SR0_TRIG       (1U << 16)  /* SR0 trigger */
#define TOM_CTRL_UDMODE_MASK    0x00060000  /* Update mode [18:17] */

/* ==========================================================================
 * ATOM (Advanced TOM) - 12 modules, 8 channels each
 * ========================================================================== */

#define GTM_ATOM0_BASE          (GTM_BASE_ADDR + 0xC000)
#define GTM_ATOM_SPACING        0x0800      /* Between ATOM modules */
#define GTM_ATOM_CH_SPACING     0x80        /* Between channels */
#define GTM_ATOM_CH_COUNT       8           /* Channels per module */
#define GTM_ATOM_MODULE_COUNT   12

/* ATOM Channel Register Offsets */
#define GTM_ATOM_CH_RDADDR      0x00        /* Read Address */
#define GTM_ATOM_CH_CTRL        0x04        /* Channel Control */
#define GTM_ATOM_CH_SR0         0x08        /* Shadow Register 0 */
#define GTM_ATOM_CH_SR1         0x0C        /* Shadow Register 1 */
#define GTM_ATOM_CH_CM0         0x10        /* Compare Register 0 */
#define GTM_ATOM_CH_CM1         0x14        /* Compare Register 1 */
#define GTM_ATOM_CH_CN0         0x18        /* Counter Register */
#define GTM_ATOM_CH_STAT        0x1C        /* Status Register */
#define GTM_ATOM_CH_IRQ_NOTIFY  0x20        /* IRQ Notification */
#define GTM_ATOM_CH_IRQ_EN      0x24        /* IRQ Enable */
#define GTM_ATOM_CH_IRQ_FORCINT 0x28        /* Force Interrupt */
#define GTM_ATOM_CH_IRQ_MODE    0x2C        /* IRQ Mode */

/* ATOM_CHx_CTRL bits */
#define ATOM_CTRL_MODE_MASK     0x00000003  /* Mode [1:0] */
#define ATOM_CTRL_TB12_SEL      (1U << 2)   /* Time base 1/2 select */
#define ATOM_CTRL_ARU_EN        (1U << 3)   /* ARU enable */
#define ATOM_CTRL_ACB_MASK      0x000001F0  /* ACB [8:4] */
#define ATOM_CTRL_CMP_CTRL      (1U << 9)   /* Compare control */
#define ATOM_CTRL_SL            (1U << 11)  /* Signal level */
#define ATOM_CTRL_CLK_SRC_MASK  0x00003000  /* Clock source [13:12] */
#define ATOM_CTRL_WR_REQ        (1U << 14)  /* Write request */
#define ATOM_CTRL_TRIG_PULSE    (1U << 15)  /* Trigger pulse */
#define ATOM_CTRL_UPEN_CTRL_MASK 0x00030000 /* Update enable [17:16] */
#define ATOM_CTRL_RST_CCU0      (1U << 18)  /* CCU0 reset source */
#define ATOM_CTRL_OSM           (1U << 19)  /* One-shot mode */
#define ATOM_CTRL_BITREV        (1U << 20)  /* Bit reverse */
#define ATOM_CTRL_EXT_TRIG      (1U << 21)  /* External trigger */
#define ATOM_CTRL_EXTTRIGOUT    (1U << 22)  /* Ext trigger out select */
#define ATOM_CTRL_OSM_TRIG      (1U << 23)  /* OSM trigger */
#define ATOM_CTRL_SOMB          (1U << 24)  /* SOMB */
#define ATOM_CTRL_FREEZE        (1U << 25)  /* Freeze */

/* ATOM Mode values */
#define ATOM_MODE_SOMP          0           /* SOMP mode */
#define ATOM_MODE_SOMC          1           /* SOMC mode */
#define ATOM_MODE_SOMI          2           /* SOMI mode */
#define ATOM_MODE_SOMS          3           /* SOMS mode */

/* ==========================================================================
 * GTM State Structure
 * ========================================================================== */

/* TOM Channel state */
typedef struct {
    uint32_t ctrl;
    uint32_t sr0;           /* Shadow register 0 */
    uint32_t sr1;           /* Shadow register 1 */
    uint32_t cm0;           /* Compare 0 (period) */
    uint32_t cm1;           /* Compare 1 (duty) */
    uint32_t cn0;           /* Counter */
    uint32_t stat;
    bool output;            /* Current output state */
    bool enabled;
} gtm_tom_ch_t;

/* ATOM Channel state */
typedef struct {
    uint32_t ctrl;
    uint32_t sr0;
    uint32_t sr1;
    uint32_t cm0;
    uint32_t cm1;
    uint32_t cn0;
    uint32_t stat;
    bool output;
    bool enabled;
} gtm_atom_ch_t;

/* TIM Channel state */
typedef struct {
    uint32_t ctrl;
    uint32_t gpr0;
    uint32_t gpr1;
    uint32_t cnt;
    uint32_t ecnt;
    bool enabled;
} gtm_tim_ch_t;

/* TBU Channel state */
typedef struct {
    uint32_t ctrl;
    uint32_t base;
    uint64_t count;         /* 24-bit or 27-bit counter */
    bool enabled;
} gtm_tbu_ch_t;

/* GTM Module state */
typedef struct gtm {
    /* Global registers */
    uint32_t rev;
    uint32_t ctrl;
    uint32_t irq_notify;
    uint32_t irq_en;
    uint32_t hw_conf;

    /* Time Base Units */
    gtm_tbu_ch_t tbu[3];

    /* TOM modules */
    gtm_tom_ch_t tom[GTM_TOM_MODULE_COUNT][GTM_TOM_CH_COUNT];
    uint32_t tom_tgc_ctrl[GTM_TOM_MODULE_COUNT][2];  /* TGC0/TGC1 per module */

    /* ATOM modules */
    gtm_atom_ch_t atom[GTM_ATOM_MODULE_COUNT][GTM_ATOM_CH_COUNT];

    /* TIM modules */
    gtm_tim_ch_t tim[GTM_TIM_MODULE_COUNT][GTM_TIM_CH_COUNT];

    /* Clock configuration */
    uint32_t cmu_clk_en;
    uint32_t cmu_gclk_num;
    uint32_t cmu_gclk_den;
    uint32_t freq_hz;       /* GTM input frequency */

} gtm_t;

/* ==========================================================================
 * GTM Functions
 * ========================================================================== */

gtm_t* gtm_create(uint32_t freq_hz);
void gtm_destroy(gtm_t *gtm);
void gtm_reset(gtm_t *gtm);
void gtm_tick(gtm_t *gtm, uint32_t cycles);

uint32_t gtm_read_reg(gtm_t *gtm, uint32_t offset);
void gtm_write_reg(gtm_t *gtm, uint32_t offset, uint32_t value);

/* TOM PWM helpers */
void gtm_tom_set_period(gtm_t *gtm, int module, int channel, uint32_t period);
void gtm_tom_set_duty(gtm_t *gtm, int module, int channel, uint32_t duty);
void gtm_tom_enable(gtm_t *gtm, int module, int channel, bool enable);
bool gtm_tom_get_output(gtm_t *gtm, int module, int channel);

/* ATOM helpers */
void gtm_atom_set_period(gtm_t *gtm, int module, int channel, uint32_t period);
void gtm_atom_set_duty(gtm_t *gtm, int module, int channel, uint32_t duty);
void gtm_atom_enable(gtm_t *gtm, int module, int channel, bool enable);

/* ADC trigger output */
bool gtm_get_adc_trigger(gtm_t *gtm, int trigger_index);

#ifdef __cplusplus
}
#endif

#endif /* GTM_H */
