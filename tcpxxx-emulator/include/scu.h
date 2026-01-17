/**
 * @file scu.h
 * @brief TC397XP System Control Unit (SCU) Interface
 *
 * The SCU controls system-level functions:
 * - Clock generation and distribution (OSC, PLL, CCU)
 * - Core reset and release control
 * - Watchdog timers (per-CPU + Safety WDT)
 * - ENDINIT protection for critical registers
 * - Reset status and control
 * - Power management
 */

#ifndef SCU_H
#define SCU_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * SCU Base Address and Size
 * ========================================================================== */

#define SCU_BASE_ADDR           0xF0036000
#define SCU_SIZE                0x400

/* ==========================================================================
 * SCU Register Offsets (from TC397 User Manual)
 * ========================================================================== */

/* Identification */
#define SCU_ID                  0x008   /* Module ID */

/* Oscillator Control */
#define SCU_OSCCON              0x010   /* OSC Control */

/* PLL Control */
#define SCU_PLLSTAT             0x014   /* PLL Status */
#define SCU_PLLCON0             0x018   /* PLL Configuration 0 */
#define SCU_PLLCON1             0x01C   /* PLL Configuration 1 */
#define SCU_PLLCON2             0x020   /* PLL Configuration 2 */

/* PLL_ERAY (FlexRay) */
#define SCU_PLLERAYSTAT         0x024   /* PLL_ERAY Status */
#define SCU_PLLERAYCON0         0x028   /* PLL_ERAY Configuration 0 */
#define SCU_PLLERAYCON1         0x02C   /* PLL_ERAY Configuration 1 */

/* Clock Control Unit */
#define SCU_CCUCON0             0x030   /* CCU Control 0 (fCPU, fSPB) */
#define SCU_CCUCON1             0x034   /* CCU Control 1 (fSTM, fGTM) */
#define SCU_CCUCON2             0x040   /* CCU Control 2 (fBBB) */
#define SCU_CCUCON3             0x044   /* CCU Control 3 */
#define SCU_CCUCON4             0x048   /* CCU Control 4 */
#define SCU_CCUCON5             0x04C   /* CCU Control 5 (fMAX, fERAY) */

/* Reset Control */
#define SCU_RSTSTAT             0x050   /* Reset Status */
#define SCU_RSTCON              0x058   /* Reset Configuration */
#define SCU_ARSTDIS             0x05C   /* Application Reset Disable */
#define SCU_SWRSTCON            0x060   /* SW Reset Configuration */

/* Reset Control 2 */
#define SCU_RSTCON2             0x064   /* Reset Configuration 2 */

/* Emergency Stop */
#define SCU_ESRCFG0             0x070   /* Emergency Stop Config 0 */
#define SCU_ESRCFG1             0x074   /* Emergency Stop Config 1 */
#define SCU_ESROCFG             0x078   /* Emergency Stop Output Config */

/* Power Management */
#define SCU_PMSWCR0             0x0C8   /* Power Management SW Control 0 */
#define SCU_PMSWCR1             0x0CC   /* Power Management SW Control 1 */
#define SCU_PMSWSTAT            0x0D0   /* Power Management Status */
#define SCU_PMSWSTATCLR         0x0D4   /* Power Management Status Clear */
#define SCU_PMCSR0              0x0E0   /* PM Control/Status CPU0 */
#define SCU_PMCSR1              0x0E4   /* PM Control/Status CPU1 */
#define SCU_PMCSR2              0x0E8   /* PM Control/Status CPU2 */
#define SCU_PMCSR3              0x0EC   /* PM Control/Status CPU3 */
#define SCU_PMCSR4              0x0F0   /* PM Control/Status CPU4 */
#define SCU_PMCSR5              0x0F4   /* PM Control/Status CPU5 */

/* Watchdog - CPU0 */
#define SCU_WDTCPU0CON0         0x100   /* WDT CPU0 Control 0 */
#define SCU_WDTCPU0CON1         0x104   /* WDT CPU0 Control 1 */
#define SCU_WDTCPU0SR           0x108   /* WDT CPU0 Status */

/* Watchdog - CPU1 */
#define SCU_WDTCPU1CON0         0x10C   /* WDT CPU1 Control 0 */
#define SCU_WDTCPU1CON1         0x110   /* WDT CPU1 Control 1 */
#define SCU_WDTCPU1SR           0x114   /* WDT CPU1 Status */

/* Watchdog - CPU2 */
#define SCU_WDTCPU2CON0         0x118   /* WDT CPU2 Control 0 */
#define SCU_WDTCPU2CON1         0x11C   /* WDT CPU2 Control 1 */
#define SCU_WDTCPU2SR           0x120   /* WDT CPU2 Status */

/* Watchdog - CPU3 */
#define SCU_WDTCPU3CON0         0x124   /* WDT CPU3 Control 0 */
#define SCU_WDTCPU3CON1         0x128   /* WDT CPU3 Control 1 */
#define SCU_WDTCPU3SR           0x12C   /* WDT CPU3 Status */

/* Watchdog - CPU4 */
#define SCU_WDTCPU4CON0         0x130   /* WDT CPU4 Control 0 */
#define SCU_WDTCPU4CON1         0x134   /* WDT CPU4 Control 1 */
#define SCU_WDTCPU4SR           0x138   /* WDT CPU4 Status */

/* Watchdog - CPU5 */
#define SCU_WDTCPU5CON0         0x13C   /* WDT CPU5 Control 0 */
#define SCU_WDTCPU5CON1         0x140   /* WDT CPU5 Control 1 */
#define SCU_WDTCPU5SR           0x144   /* WDT CPU5 Status */

/* Safety Watchdog */
#define SCU_WDTSCON0            0x148   /* Safety WDT Control 0 */
#define SCU_WDTSCON1            0x14C   /* Safety WDT Control 1 */
#define SCU_WDTSSR              0x150   /* Safety WDT Status */

/* Trap Control */
#define SCU_TRAPSTAT            0x160   /* Trap Status */
#define SCU_TRAPDIS0            0x164   /* Trap Disable 0 */
#define SCU_TRAPDIS1            0x168   /* Trap Disable 1 */
#define SCU_TRAPSET             0x170   /* Trap Set */
#define SCU_TRAPCLR             0x174   /* Trap Clear */

/* ENDINIT Protection */
#define SCU_EICON0              0x210   /* ENDINIT Control 0 */
#define SCU_EICON1              0x214   /* ENDINIT Control 1 */
#define SCU_EISR                0x218   /* ENDINIT Status */
#define SCU_SEICON0             0x1B0   /* Safety ENDINIT Control 0 */
#define SCU_SEICON1             0x1B4   /* Safety ENDINIT Control 1 */
#define SCU_SEISR               0x1B8   /* Safety ENDINIT Status */

/* CPU Control */
#define SCU_CPU0CON             0x220   /* CPU0 Control (boot mode) */
#define SCU_CPU1CON             0x224   /* CPU1 Control */
#define SCU_CPU2CON             0x228   /* CPU2 Control */
#define SCU_CPU3CON             0x22C   /* CPU3 Control */
#define SCU_CPU4CON             0x230   /* CPU4 Control */
#define SCU_CPU5CON             0x234   /* CPU5 Control */

/* Access Control */
#define SCU_ACCEN0              0x3FC   /* Access Enable 0 */

/* ==========================================================================
 * Register Bit Definitions
 * ========================================================================== */

/* OSCCON - Oscillator Control */
#define OSCCON_PLLLV            (1U << 1)   /* PLL Lock Detect Threshold Low */
#define OSCCON_OSCRES           (1U << 2)   /* Oscillator Reset */
#define OSCCON_GAINSEL_MASK     0x00000018  /* Gain Selection */
#define OSCCON_MODE_MASK        0x00000060  /* Mode Selection */
#define OSCCON_SHBY             (1U << 7)   /* Shaper Bypass */
#define OSCCON_PLLHV            (1U << 8)   /* PLL Lock Detect Threshold High */
#define OSCCON_CAP0EN           (1U << 16)  /* Capacitor 0 Enable */
#define OSCCON_CAP1EN           (1U << 17)  /* Capacitor 1 Enable */
#define OSCCON_CAP2EN           (1U << 18)  /* Capacitor 2 Enable */
#define OSCCON_CAP3EN           (1U << 19)  /* Capacitor 3 Enable */
#define OSCCON_OSCVAL_MASK      0x1F000000  /* Oscillator Value */

/* PLLSTAT - PLL Status */
#define PLLSTAT_VCOBYST         (1U << 0)   /* VCO Bypass Status */
#define PLLSTAT_PWDSTAT         (1U << 1)   /* PLL Power-down Status */
#define PLLSTAT_VCOLOCK         (1U << 2)   /* VCO Lock Status */
#define PLLSTAT_FINDIS          (1U << 3)   /* Input clock disconnected */
#define PLLSTAT_K1RDY           (1U << 4)   /* K1 Divider Ready */
#define PLLSTAT_K2RDY           (1U << 5)   /* K2 Divider Ready */

/* PLLCON0 - PLL Configuration 0 */
#define PLLCON0_VCOBYP          (1U << 0)   /* VCO Bypass */
#define PLLCON0_VCOPWD          (1U << 1)   /* VCO Power Down */
#define PLLCON0_MODEN           (1U << 2)   /* Modulation Enable */
#define PLLCON0_SETFINDIS       (1U << 4)   /* Set Status Bit FINDIS */
#define PLLCON0_CLRFINDIS       (1U << 5)   /* Clear Status Bit FINDIS */
#define PLLCON0_OSCDISCDIS      (1U << 6)   /* OSC Disconnect Disable */
#define PLLCON0_PLLPWD          (1U << 16)  /* PLL Power Down */
#define PLLCON0_RESLD           (1U << 18)  /* Restart Lock Detection */
#define PLLCON0_NDIV_MASK       0x7F000000  /* N Divider Value */
#define PLLCON0_NDIV_SHIFT      24
#define PLLCON0_PDIV_MASK       0x00070000  /* P Divider Value (bits 18:16 actually in PLLCON1) */

/* PLLCON1 - PLL Configuration 1 */
#define PLLCON1_K1DIV_MASK      0x0000007F  /* K1 Divider */
#define PLLCON1_NDIV_MASK       0x00007F00  /* N Divider (additional) */
#define PLLCON1_NDIV_SHIFT      8
#define PLLCON1_K2DIV_MASK      0x007F0000  /* K2 Divider */
#define PLLCON1_K2DIV_SHIFT     16
#define PLLCON1_PDIV_MASK       0x07000000  /* P Divider */
#define PLLCON1_PDIV_SHIFT      24
#define PLLCON1_K3DIV_MASK      0x70000000  /* K3 Divider */
#define PLLCON1_K3DIV_SHIFT     28

/* CCUCON0 - Clock Control Unit 0 */
#define CCUCON0_STMDIV_MASK     0x0000000F  /* STM Divider */
#define CCUCON0_GTMDIV_MASK     0x000000F0  /* GTM Divider */
#define CCUCON0_GTMDIV_SHIFT    4
#define CCUCON0_SRIDIV_MASK     0x00000F00  /* SRI Divider */
#define CCUCON0_SRIDIV_SHIFT    8
#define CCUCON0_LPDIV_MASK      0x0000F000  /* Low Power Divider */
#define CCUCON0_LPDIV_SHIFT     12
#define CCUCON0_SPBDIV_MASK     0x000F0000  /* SPB Divider */
#define CCUCON0_SPBDIV_SHIFT    16
#define CCUCON0_BBBDIV_MASK     0x00F00000  /* BBB Divider */
#define CCUCON0_BBBDIV_SHIFT    20
#define CCUCON0_FSIDIV_MASK     0x0F000000  /* FSI Divider */
#define CCUCON0_FSIDIV_SHIFT    24
#define CCUCON0_FSI2DIV_MASK    0xF0000000  /* FSI2 Divider */
#define CCUCON0_FSI2DIV_SHIFT   28
#define CCUCON0_CLKSEL_MASK     0x30000000  /* Clock Selection */
#define CCUCON0_UP              (1U << 30)  /* Update Request */
#define CCUCON0_LCK             (1U << 31)  /* Lock Status */

/* RSTSTAT - Reset Status */
#define RSTSTAT_ESR0            (1U << 0)   /* ESR0 Reset */
#define RSTSTAT_ESR1            (1U << 1)   /* ESR1 Reset */
#define RSTSTAT_SMU             (1U << 2)   /* SMU Reset */
#define RSTSTAT_SW              (1U << 3)   /* Software Reset */
#define RSTSTAT_STM0            (1U << 4)   /* STM0 Reset */
#define RSTSTAT_STM1            (1U << 5)   /* STM1 Reset */
#define RSTSTAT_STM2            (1U << 6)   /* STM2 Reset */
#define RSTSTAT_PORST           (1U << 16)  /* Power-On Reset */
#define RSTSTAT_CB0             (1U << 18)  /* Cerberus Reset CPU0 */
#define RSTSTAT_CB1             (1U << 19)  /* Cerberus Reset CPU1 */
#define RSTSTAT_CB3             (1U << 20)  /* Cerberus Reset CPU3 */
#define RSTSTAT_EVR13           (1U << 23)  /* EVR13 Reset */
#define RSTSTAT_EVR33           (1U << 24)  /* EVR33 Reset */
#define RSTSTAT_SWD             (1U << 25)  /* Supply Watchdog Reset */
#define RSTSTAT_STBYR           (1U << 28)  /* Standby Ram Reset */

/* RSTCON - Reset Configuration */
#define RSTCON_ESR0             (3U << 0)   /* ESR0 Reset Type */
#define RSTCON_ESR1             (3U << 2)   /* ESR1 Reset Type */
#define RSTCON_SMU              (3U << 4)   /* SMU Reset Type */
#define RSTCON_SW               (3U << 6)   /* SW Reset Type */
#define RSTCON_STM0             (3U << 8)   /* STM0 Reset Type */

/* SWRSTCON - SW Reset Configuration */
#define SWRSTCON_SWRSTREQ       (1U << 1)   /* SW Reset Request */

/* WDTCPUxCON0 - Watchdog Control 0 */
#define WDTCON0_ENDINIT         (1U << 0)   /* ENDINIT Bit */
#define WDTCON0_LCK             (1U << 1)   /* Lock Bit */
#define WDTCON0_PW_MASK         0x0000FFFC  /* Password */
#define WDTCON0_PW_SHIFT        2
#define WDTCON0_REL_MASK        0xFFFF0000  /* Reload Value */
#define WDTCON0_REL_SHIFT       16

/* WDTCPUxCON1 - Watchdog Control 1 */
#define WDTCON1_CLRIRF          (1U << 0)   /* Clear IR */
#define WDTCON1_IR0             (1U << 2)   /* IR Bit 0 */
#define WDTCON1_IR1             (1U << 3)   /* IR Bit 1 */
#define WDTCON1_DR              (1U << 4)   /* Disable Request */
#define WDTCON1_UR              (1U << 5)   /* Unlock Request */
#define WDTCON1_PAR             (1U << 7)   /* Parity Bit */

/* WDTCPUxSR - Watchdog Status */
#define WDTSR_AE                (1U << 0)   /* Access Error */
#define WDTSR_OE                (1U << 1)   /* Overflow Error */
#define WDTSR_IS0               (1U << 2)   /* Input Status 0 */
#define WDTSR_IS1               (1U << 3)   /* Input Status 1 */
#define WDTSR_DS                (1U << 4)   /* Disable Status */
#define WDTSR_TO                (1U << 5)   /* Timeout Mode */
#define WDTSR_US                (1U << 6)   /* Unlock Status */
#define WDTSR_PAS               (1U << 7)   /* Password Auto-sequence Status */
#define WDTSR_TIM_MASK          0xFFFF0000  /* Timer Value */
#define WDTSR_TIM_SHIFT         16

/* CPUxCON - CPU Control */
#define CPUCON_PC_MASK          0xFFFFFFFE  /* Program Counter */
#define CPUCON_PC_SHIFT         1

/* PMCSR - Power Management Control/Status */
#define PMCSR_REQSLP_MASK       0x00000003  /* Request Sleep Mode */
#define PMCSR_PMST_MASK         0x00000700  /* PM State */
#define PMCSR_PMST_SHIFT        8

/* ==========================================================================
 * Constants
 * ========================================================================== */

/* TC397XP typical clock values */
#define SCU_OSC_FREQ_HZ         20000000    /* 20 MHz external crystal */
#define SCU_PLL_MAX_FREQ_HZ     300000000   /* 300 MHz max PLL output */
#define SCU_CPU_MAX_FREQ_HZ     300000000   /* 300 MHz max CPU clock */
#define SCU_SPB_MAX_FREQ_HZ     100000000   /* 100 MHz max SPB clock */
#define SCU_STM_MAX_FREQ_HZ     100000000   /* 100 MHz max STM clock */

/* Number of CPUs with watchdogs */
#define SCU_NUM_CPU_WDTS        6

/* Module ID */
#define SCU_MODULE_ID           0x00B4C000  /* TC397 SCU Module ID */

/* ==========================================================================
 * Types
 * ========================================================================== */

/**
 * @brief Watchdog state per CPU
 */
typedef struct {
    uint32_t con0;          /* Control Register 0 */
    uint32_t con1;          /* Control Register 1 */
    uint32_t sr;            /* Status Register */
    uint32_t reload;        /* Reload value */
    uint32_t timer;         /* Current timer value */
    bool enabled;           /* WDT enabled */
    bool locked;            /* Locked state */
} scu_wdt_t;

/**
 * @brief PLL state
 */
typedef struct {
    uint32_t stat;          /* Status register */
    uint32_t con0;          /* Configuration 0 */
    uint32_t con1;          /* Configuration 1 */
    uint32_t con2;          /* Configuration 2 (if applicable) */
    bool locked;            /* PLL lock status */
    bool bypassed;          /* VCO bypass mode */
    bool powered_down;      /* Power down state */
    uint32_t freq_hz;       /* Current output frequency */
} scu_pll_t;

/**
 * @brief SCU state structure
 */
typedef struct scu {
    /* Module identification */
    uint32_t id;

    /* Oscillator */
    uint32_t osccon;
    uint32_t osc_freq_hz;

    /* PLLs */
    scu_pll_t pll;          /* Main system PLL */
    scu_pll_t pll_eray;     /* FlexRay PLL */

    /* Clock Control */
    uint32_t ccucon[6];     /* CCUCONx registers */
    uint32_t cpu_freq_hz;   /* Current CPU frequency */
    uint32_t spb_freq_hz;   /* Current SPB frequency */
    uint32_t stm_freq_hz;   /* Current STM frequency */

    /* Reset */
    uint32_t rststat;       /* Reset status */
    uint32_t rstcon;        /* Reset configuration */
    uint32_t rstcon2;       /* Reset configuration 2 */
    uint32_t arstdis;       /* Application reset disable */
    uint32_t swrstcon;      /* SW reset configuration */

    /* Emergency Stop */
    uint32_t esrcfg[2];     /* Emergency stop config */
    uint32_t esrocfg;       /* Emergency stop output config */

    /* Power Management */
    uint32_t pmswcr[2];     /* PM SW control */
    uint32_t pmswstat;      /* PM status */
    uint32_t pmcsr[6];      /* PM control/status per CPU */

    /* Watchdogs - per CPU + Safety */
    scu_wdt_t wdt_cpu[SCU_NUM_CPU_WDTS];
    scu_wdt_t wdt_safety;

    /* ENDINIT state per CPU */
    bool endinit_cpu[SCU_NUM_CPU_WDTS];
    bool endinit_safety;

    /* CPU Control */
    uint32_t cpucon[6];     /* CPU boot PC / control */
    bool cpu_started[6];    /* CPU start flags */

    /* Trap Control */
    uint32_t trapstat;
    uint32_t trapdis[2];

    /* Access protection */
    uint32_t accen0;

    /* Callbacks (optional) */
    void (*on_cpu_start)(uint32_t core_id, uint32_t pc, void *user);
    void (*on_reset)(uint32_t reset_type, void *user);
    void *callback_user;

} scu_t;

/* ==========================================================================
 * SCU Lifecycle
 * ========================================================================== */

/**
 * @brief Create and initialize SCU
 * @return Pointer to SCU, or NULL on error
 */
scu_t* scu_create(void);

/**
 * @brief Destroy SCU
 * @param scu SCU to destroy
 */
void scu_destroy(scu_t *scu);

/**
 * @brief Reset SCU to power-on state
 * @param scu SCU instance
 */
void scu_reset(scu_t *scu);

/* ==========================================================================
 * Register Access
 * ========================================================================== */

/**
 * @brief Read SCU register
 * @param scu SCU instance
 * @param offset Register offset from SCU base
 * @return Register value
 */
uint32_t scu_read_reg(scu_t *scu, uint32_t offset);

/**
 * @brief Write SCU register
 * @param scu SCU instance
 * @param offset Register offset from SCU base
 * @param value Value to write
 */
void scu_write_reg(scu_t *scu, uint32_t offset, uint32_t value);

/* ==========================================================================
 * ENDINIT Protection
 * ========================================================================== */

/**
 * @brief Clear ENDINIT for a CPU (unlock protected registers)
 * @param scu SCU instance
 * @param cpu_id CPU ID (0-5), or 0xFF for safety ENDINIT
 */
void scu_clear_endinit(scu_t *scu, uint32_t cpu_id);

/**
 * @brief Set ENDINIT for a CPU (lock protected registers)
 * @param scu SCU instance
 * @param cpu_id CPU ID (0-5), or 0xFF for safety ENDINIT
 */
void scu_set_endinit(scu_t *scu, uint32_t cpu_id);

/**
 * @brief Check if ENDINIT is clear for a CPU
 * @param scu SCU instance
 * @param cpu_id CPU ID (0-5)
 * @return true if ENDINIT is clear (unlocked)
 */
bool scu_is_endinit_clear(scu_t *scu, uint32_t cpu_id);

/* ==========================================================================
 * Clock Functions
 * ========================================================================== */

/**
 * @brief Get current CPU clock frequency
 * @param scu SCU instance
 * @return Frequency in Hz
 */
uint32_t scu_get_freq_hz(scu_t *scu);

/**
 * @brief Get current SPB clock frequency
 * @param scu SCU instance
 * @return Frequency in Hz
 */
uint32_t scu_get_spb_freq_hz(scu_t *scu);

/**
 * @brief Get current STM clock frequency
 * @param scu SCU instance
 * @return Frequency in Hz
 */
uint32_t scu_get_stm_freq_hz(scu_t *scu);

/**
 * @brief Recalculate all clock frequencies from register values
 * @param scu SCU instance
 */
void scu_update_clocks(scu_t *scu);

/* ==========================================================================
 * CPU Control
 * ========================================================================== */

/**
 * @brief Start a CPU core
 * @param scu SCU instance
 * @param core_id Core ID (1-5, core 0 starts at reset)
 * @param pc Initial program counter
 * @return 0 on success, -1 on error
 *
 * Note: Core 0 is always started at reset vector.
 * Cores 1-5 are started by writing to CPUxCON registers.
 */
int scu_start_cpu(scu_t *scu, uint32_t core_id, uint32_t pc);

/**
 * @brief Check if a CPU has been started
 * @param scu SCU instance
 * @param core_id Core ID (0-5)
 * @return true if started
 */
bool scu_is_cpu_started(scu_t *scu, uint32_t core_id);

/**
 * @brief Get CPU start PC from CPUxCON
 * @param scu SCU instance
 * @param core_id Core ID (1-5)
 * @return Start address, or 0 if not configured
 */
uint32_t scu_get_cpu_start_pc(scu_t *scu, uint32_t core_id);

/* ==========================================================================
 * Watchdog Functions
 * ========================================================================== */

/**
 * @brief Tick watchdog timers
 * @param scu SCU instance
 * @param cycles Number of cycles elapsed
 * @return Bitmask of cores with WDT timeout (bit N = core N)
 */
uint32_t scu_tick_wdts(scu_t *scu, uint32_t cycles);

/**
 * @brief Service (feed) a CPU watchdog
 * @param scu SCU instance
 * @param cpu_id CPU ID (0-5)
 * @param password Watchdog password
 * @return 0 on success, -1 on error
 */
int scu_service_wdt(scu_t *scu, uint32_t cpu_id, uint32_t password);

/**
 * @brief Disable a CPU watchdog (requires ENDINIT sequence)
 * @param scu SCU instance
 * @param cpu_id CPU ID (0-5)
 * @return 0 on success, -1 on error
 */
int scu_disable_wdt(scu_t *scu, uint32_t cpu_id);

/* ==========================================================================
 * Reset Functions
 * ========================================================================== */

/**
 * @brief Request software reset
 * @param scu SCU instance
 */
void scu_request_sw_reset(scu_t *scu);

/**
 * @brief Get reset status
 * @param scu SCU instance
 * @return Reset status register value
 */
uint32_t scu_get_reset_status(scu_t *scu);

/**
 * @brief Clear reset status bits
 * @param scu SCU instance
 * @param mask Bits to clear
 */
void scu_clear_reset_status(scu_t *scu, uint32_t mask);

/* ==========================================================================
 * Callbacks
 * ========================================================================== */

/**
 * @brief Set callback for CPU start events
 * @param scu SCU instance
 * @param callback Function to call (core_id, pc, user)
 * @param user User data for callback
 */
void scu_set_cpu_start_callback(scu_t *scu,
    void (*callback)(uint32_t core_id, uint32_t pc, void *user), void *user);

/**
 * @brief Set callback for reset events
 * @param scu SCU instance
 * @param callback Function to call (reset_type, user)
 * @param user User data for callback
 */
void scu_set_reset_callback(scu_t *scu,
    void (*callback)(uint32_t reset_type, void *user), void *user);

#ifdef __cplusplus
}
#endif

#endif /* SCU_H */
