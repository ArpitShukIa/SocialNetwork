import pytest
from brownie import exceptions

from scripts.deploy import deploy
from scripts.helpful_scripts import get_account, ether


@pytest.fixture
def social_network():
    return deploy()


def test_post_can_be_created(social_network):
    author = get_account()

    # Empty content
    with pytest.raises(exceptions.VirtualMachineError):
        social_network.createPost('', {'from': author})

    tx = social_network.createPost('Test post', {'from': author})

    assert social_network.postCount() == 1

    assert social_network.posts(1) == (1, 'Test post', 0, author)

    assert tx.events['PostCreated']['id'] == 1
    assert tx.events['PostCreated']['content'] == 'Test post'
    assert tx.events['PostCreated']['tipAmount'] == 0
    assert tx.events['PostCreated']['author'] == author


def test_post_can_be_tipped(social_network):
    author = get_account()
    tipper = get_account(index=1)

    social_network.createPost('Test post', {'from': author})

    author_initial_balance = author.balance()
    tip_amount = ether(1)

    # Invalid post id
    with pytest.raises(exceptions.VirtualMachineError):
        social_network.tipPost(99, {'from': tipper, 'value': tip_amount})

    # Cannot tip own post
    with pytest.raises(exceptions.VirtualMachineError):
        social_network.tipPost(1, {'from': author, 'value': tip_amount})

    tx = social_network.tipPost(1, {'from': tipper, 'value': tip_amount})

    assert author.balance() == author_initial_balance + tip_amount

    assert social_network.posts(1) == (1, 'Test post', tip_amount, author)

    assert tx.events['PostTipped']['id'] == 1
    assert tx.events['PostTipped']['content'] == 'Test post'
    assert tx.events['PostTipped']['tipAmount'] == tip_amount
    assert tx.events['PostTipped']['author'] == author
