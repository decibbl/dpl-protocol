use anchor_lang::prelude::*;

use crate::{errors::ProtocolErrors, states::{user::User, platform::Platform}};

#[derive(Accounts)]
pub struct Unsubscribe<'info> {
    /// platform account
    pub platform: Account<'info, Platform>,

    /// user account
    #[account(mut)]
    pub user: Account<'info, User>,

    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn unsubscribe_handler(ctx: Context<Unsubscribe>) -> Result<()> {
    let user = &mut ctx.accounts.user;

    // check if user is already subscribed
    if user.subscription.start_timestamp == 0 {
        return err!(ProtocolErrors::NotSubscribed);
    }

    let clock = Clock::get()?;

    // can only unsubscribe when its ahead of end timestamp
    if clock.unix_timestamp < user.subscription.end_timestamp {
        return err!(ProtocolErrors::InvalidUnsubscribe);
    }

    user.subscription.mint = Default::default();
    user.subscription.start_timestamp = 0;
    user.subscription.end_timestamp = 0;
    user.subscription.subscribed_plan = Default::default();

    Ok(())
}
