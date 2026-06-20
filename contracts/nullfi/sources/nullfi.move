module nullfi::nullfi {
    use sui::object::{Self, UID, ID};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use std::string::String;

    // ===== CONSTANTS =====
    const ESCROW_ACTIVE: u8 = 0;
    const ESCROW_COMPLETED: u8 = 3;

    const ESCROW_FEE_BPS: u64 = 10;
    const RELEASE_FEE_BPS: u64 = 100;

    // ===== STRUCTS =====

    struct Escrow has key {
        id: UID,
        client: address,
        freelancer: address,
        job_title: String,
        job_category: String,
        total_amount: u64,
        released_amount: u64,
        balance: Balance<SUI>,
        milestone_count: u64,
        completed_milestones: u64,
        status: u8,
        created_at: u64,
        updated_at: u64,
    }

    struct CreditScore has key {
        id: UID,
        user: address,
        rating: u64,
        tier: u8,
        total_completed: u64,
        total_earned: u64,
        on_time_releases: u64,
        dispute_count: u64,
        refund_count: u64,
        last_updated: u64,
    }

    struct Treasury has key {
        id: UID,
        balance: Balance<SUI>,
        total_fees_collected: u64,
    }

    // ===== EVENTS =====

    struct EscrowCreated has copy, drop {
        escrow_id: ID,
        client: address,
        freelancer: address,
        total_amount: u64,
        milestone_count: u64,
    }

    struct MilestoneReleased has copy, drop {
        escrow_id: ID,
        milestone_num: u64,
        amount: u64,
    }

    struct EscrowCompleted has copy, drop {
        escrow_id: ID,
        total_released: u64,
    }

    struct EscrowDisputed has copy, drop {
        escrow_id: ID,
        reason: String,
    }

    // ===== INIT =====

    fun init(ctx: &mut TxContext) {
        let treasury = Treasury {
            id: object::new(ctx),
            balance: balance::zero(),
            total_fees_collected: 0,
        };
        transfer::share_object(treasury);
    }

    // ===== ESCROW FUNCTIONS =====

    public fun create_escrow(
        job_title: String,
        job_category: String,
        freelancer: address,
        total_amount: u64,
        milestone_count: u64,
        coin: Coin<SUI>,
        treasury: &mut Treasury,
        ctx: &mut TxContext,
    ) {
        let coin_value = coin::value(&coin);
        assert!(coin_value == total_amount, 1);
        assert!(freelancer != tx_context::sender(ctx), 2);
        assert!(milestone_count > 0, 3);

        let fee_amount = (total_amount * ESCROW_FEE_BPS) / 10000;
        let net_amount = total_amount - fee_amount;

        let coin_balance = coin::into_balance(coin);
        let fee_balance = balance::split(&mut coin_balance, fee_amount);
        balance::join(&mut treasury.balance, fee_balance);
        treasury.total_fees_collected = treasury.total_fees_collected + fee_amount;

        let escrow = Escrow {
            id: object::new(ctx),
            client: tx_context::sender(ctx),
            freelancer,
            job_title,
            job_category,
            total_amount: net_amount,
            released_amount: 0,
            balance: coin_balance,
            milestone_count,
            completed_milestones: 0,
            status: ESCROW_ACTIVE,
            created_at: tx_context::epoch(ctx),
            updated_at: tx_context::epoch(ctx),
        };

        let escrow_id = object::id(&escrow);

        event::emit(EscrowCreated {
            escrow_id,
            client: tx_context::sender(ctx),
            freelancer,
            total_amount: net_amount,
            milestone_count,
        });

        transfer::share_object(escrow);
    }

    public fun release_milestone(
        escrow: &mut Escrow,
        amount: u64,
        treasury: &mut Treasury,
        ctx: &mut TxContext,
    ) {
        assert!(tx_context::sender(ctx) == escrow.client, 4);
        assert!(escrow.status == ESCROW_ACTIVE, 5);
        assert!(amount > 0, 6);
        assert!(escrow.released_amount + amount <= escrow.total_amount, 7);

        let fee_amount = (amount * RELEASE_FEE_BPS) / 10000;
        let net_amount = amount - fee_amount;

        let fee_balance = balance::split(&mut escrow.balance, fee_amount);
        balance::join(&mut treasury.balance, fee_balance);
        treasury.total_fees_collected = treasury.total_fees_collected + fee_amount;

        let payment = balance::split(&mut escrow.balance, net_amount);
        let coin = coin::from_balance(payment, ctx);
        transfer::public_transfer(coin, escrow.freelancer);

        escrow.released_amount = escrow.released_amount + net_amount;
        escrow.completed_milestones = escrow.completed_milestones + 1;
        escrow.updated_at = tx_context::epoch(ctx);

        event::emit(MilestoneReleased {
            escrow_id: object::id(escrow),
            milestone_num: escrow.completed_milestones,
            amount: net_amount,
        });

        if (escrow.completed_milestones == escrow.milestone_count) {
            escrow.status = ESCROW_COMPLETED;
            event::emit(EscrowCompleted {
                escrow_id: object::id(escrow),
                total_released: escrow.released_amount,
            });
        };
    }

    public fun dispute_escrow(
        escrow: &mut Escrow,
        reason: String,
        ctx: &TxContext,
    ) {
        assert!(
            tx_context::sender(ctx) == escrow.client ||
            tx_context::sender(ctx) == escrow.freelancer,
            8
        );

        assert!(escrow.status == ESCROW_ACTIVE, 5);

        escrow.status = 2; // DISPUTED
        escrow.updated_at = tx_context::epoch(ctx);

        event::emit(EscrowDisputed {
            escrow_id: object::id(escrow),
            reason,
        });
    }

    // ===== VIEW FUNCTIONS =====

    public fun get_escrow_info(escrow: &Escrow): (address, address, u64, u64, u64, u8) {
        (
            escrow.client,
            escrow.freelancer,
            escrow.total_amount,
            escrow.released_amount,
            escrow.completed_milestones,
            escrow.status,
        )
    }

    public fun get_escrow_balance(escrow: &Escrow): u64 {
        balance::value(&escrow.balance)
    }
}
