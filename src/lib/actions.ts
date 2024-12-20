import {
  Account,
  AccountPositions,
  Balance,
  Bank,
  CalCollateralResponse,
  CheckPaymentResultResponse,
  GetPaymentInfoResponse,
  ListBanksResponseItem,
  DomeFiResponse,
  Payment,
  Asset,
  AssetWithPrice,
  BankWithState,
  ListBalanceResponseItem,
  CreatePaymentRequest,
  UserAssetAmount,
  ClosePositionPreviewResponse,
} from '@/types/account';
import { sessionManager } from './sessionManager';
import { env } from '@/env.mjs';
import { handleError } from '@/lib/errorHandler';
import { AccountSummary, ActionType } from './mrgnlend';
import { SimulatedActionPreview } from '@/components/action-box/actions/lend-box/utils/lend-simulation.utils';
import { TokenData } from '@/types/type';
import { TradeGroupsCache } from '@/app/stores/tradeStore';
import { ActionPreview } from '@/components/common/ActionBox/ActionBoxPreview/Components/LendingPreview/LendingPreview.utils';
// import { AssetPriceData } from '@/components/common/AssetList/utils';
import { PriceData } from '@/types/account';

export async function newAccount() {
  try {
    const jwtToken = await sessionManager.getJwtToken();
    if (!jwtToken) {
      throw new Error('Unauthorized: Missing access token');
    }

    const response = await fetch(
      `${env.NEXT_PUBLIC_BACKEND_URL}/group/${env.NEXT_PUBLIC_GROUP_ID}/account`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: DomeFiResponse<Account> | Account = await response.json();
    if (data && 'code' in data) {
      throw new Error(
        (data as DomeFiResponse<Account>).message || 'unknown error',
      );
    }
    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function getUserAssetsInfo(
  assetIds: string[],
): Promise<UserAssetAmount[] | null> {
  try {
    const jwtToken = await sessionManager.getJwtToken();
    if (!jwtToken) {
      return null;
    }

    const response = await fetch(
      `${env.NEXT_PUBLIC_BACKEND_URL}/user/asset-amount`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetIds),
      },
    );
    const data: UserAssetAmount[] = await response.json();
    return data;
  } catch (error) {
    return null;
  }
}

export async function getTradeGroupsMap(): Promise<TradeGroupsCache | null> {
  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_BACKEND_URL}/dome/trade-groups`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TradeGroupsCache = await response.json();
    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function getDomeBanks(): Promise<BankWithState[] | null> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/dome/banks`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function getDomeAssets(): Promise<TokenData[] | null> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/dome/assets`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function getDomeTokenData(): Promise<TokenData[] | null> {
  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_BACKEND_URL}/dome/token-metadata`,
    );
    const data = await response.json();
    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function actionPreview(
  accountId: string,
  bankId: string,
  amount: string,
  actionMode: ActionType,
): Promise<ActionPreview | null> {
  try {
    const jwtToken = await sessionManager.getJwtToken();
    if (!jwtToken) {
      throw new Error('Unauthorized: Missing access token');
    }

    const response = await fetch(
      `${env.NEXT_PUBLIC_BACKEND_URL}/dome/account/${accountId}/action-preview`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bankId, amount, actionMode }),
      },
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(`${data.message}`);
    }

    const data: ActionPreview = await response.json();
    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function simulatePreview(
  accountId: string,
  bankId: string,
  amount: string,
  actionMode: ActionType,
): Promise<SimulatedActionPreview | null> {
  try {
    const jwtToken = await sessionManager.getJwtToken();
    if (!jwtToken) {
      throw new Error('Unauthorized: Missing access token');
    }

    const response = await fetch(
      `${env.NEXT_PUBLIC_BACKEND_URL}/account/${accountId}/simulate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bankId, amount, actionMode }),
      },
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(`${data.message}`);
    }

    const data: SimulatedActionPreview = await response.json();
    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function accountSummary(
  accountId: string,
): Promise<AccountSummary | null> {
  try {
    const jwtToken = await sessionManager.getJwtToken();
    if (!jwtToken) {
      throw new Error('Unauthorized: Missing access token');
    }

    const response = await fetch(
      `${env.NEXT_PUBLIC_BACKEND_URL}/account/${accountId}/summary`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(`${data.message}`);
    }

    const data: AccountSummary = await response.json();
    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function listBalances(
  accountId: string,
): Promise<ListBalanceResponseItem[] | null> {
  try {
    const jwtToken = await sessionManager.getJwtToken();
    if (!jwtToken) {
      throw new Error('Unauthorized: Missing access token');
    }

    const response = await fetch(
      `${env.NEXT_PUBLIC_BACKEND_URL}/account/${accountId}/balances`,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    const data: any = await response.json();

    if (!response.ok) {
      throw new Error(`${data.message}`);
    }

    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function listBanks(
  groupId: string = env.NEXT_PUBLIC_GROUP_ID,
): Promise<BankWithState[] | null> {
  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_BACKEND_URL}/group/${groupId}/banks`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`${data.message}`);
    }

    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function getGroupAssetsWithPrice(
  groupId: string = env.NEXT_PUBLIC_GROUP_ID,
): Promise<AssetWithPrice[] | null> {
  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_BACKEND_URL}/group/${groupId}/assets`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const data: any = await response.json();

    if (!response.ok) {
      throw new Error(`${data.message}`);
    }

    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function getGroupAccounts(
  groupId: string = env.NEXT_PUBLIC_GROUP_ID,
): Promise<Account[] | null> {
  try {
    const jwtToken = await sessionManager.getJwtToken();
    if (!jwtToken) {
      return null;
    }
    const response = await fetch(
      `${env.NEXT_PUBLIC_BACKEND_URL}/group/${groupId}/accounts`,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function getAccounts(): Promise<Account[] | null> {
  try {
    const jwtToken = await sessionManager.getJwtToken();
    if (!jwtToken) {
      return null;
    }

    const response = await fetch(
      `${env.NEXT_PUBLIC_BACKEND_URL}/group/${env.NEXT_PUBLIC_GROUP_ID}/accounts`,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: Account[] = await response.json();
    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function closePositionPreview({
  accountId,
  groupId,
}: {
  accountId: string;
  groupId: string;
}): Promise<ClosePositionPreviewResponse | null> {
  try {
    const jwtToken = await sessionManager.getJwtToken();
    if (!jwtToken) {
      throw new Error('Unauthorized: Missing access token');
    }

    const response = await fetch(
      `${env.NEXT_PUBLIC_BACKEND_URL}/dome/account/${accountId}/close-position-preview`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`${data.message}`);
    }

    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
}
export async function createPayment({
  bankId,
  accountId,
  amount,
  action,
  meta,
  loopOptions,
  closePosition,
}: CreatePaymentRequest): Promise<string | null> {
  try {
    const jwtToken = await sessionManager.getJwtToken();
    if (!jwtToken) {
      throw new Error('Unauthorized: Missing access token');
    }

    const response = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/payment`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bankId,
        accountId,
        amount,
        action,
        meta,
        loopOptions,
        closePosition,
      }),
    });

    const data: any = await response.json();

    if (!response.ok) {
      throw new Error(`${data.message}`);
    }

    return data.requestId;
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function createLoopingPayment(
  request: CreatePaymentRequest,
): Promise<string | null> {
  return createPayment(request);
}

export async function checkPaymentResult(
  requestId: string,
): Promise<CheckPaymentResultResponse | null> {
  try {
    const jwtToken = await sessionManager.getJwtToken();
    if (!jwtToken) {
      throw new Error('Unauthorized: Missing access token');
    }

    const response = await fetch(
      `${env.NEXT_PUBLIC_BACKEND_URL}/payment?requestId=${requestId}`,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const data: any = await response.json();

    if (!response.ok) {
      throw new Error(`${data.message}`);
    }

    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function getPaymentInfo(
  id: string,
): Promise<GetPaymentInfoResponse | null> {
  try {
    const jwtToken = await sessionManager.getJwtToken();
    if (!jwtToken) {
      throw new Error('Unauthorized: Missing access token');
    }

    const response = await fetch(
      `${env.NEXT_PUBLIC_BACKEND_URL}/payment/${id}`,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const data: any = await response.json();

    if (!response.ok) {
      throw new Error(`${data.message}`);
    }

    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function getJwtToken(accessToken: string): Promise<string | null> {
  try {
    console.log(`${env.NEXT_PUBLIC_BACKEND_URL}/user/connect`);
    const response = await fetch(
      `${env.NEXT_PUBLIC_BACKEND_URL}/user/connect`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ accessToken }),
      },
    );

    console.log(response);

    if (!response.ok) {
      throw new Error('Failed to fetch JWT token');
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function getTokenPriceHistory(
  assetId: string,
  type: number,
): Promise<PriceData[] | null> {
  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_BACKEND_URL}/markets/history-price?typ=${type}&assetId=${assetId}`,
    );
    const data = await response.json();
    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function getAssetInfo(assetId: string): Promise<any | null> {
  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_BACKEND_URL}/markets/asset-info?assetId=${assetId}`,
    );
    const data = await response.json();
    return data;
  } catch (error) {
    handleError(error);
    return null;
  }
}
