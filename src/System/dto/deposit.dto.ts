import { IsEnum, IsNotEmpty } from 'class-validator';
import { DepositAmount } from '../../constants/DepositAmount';
import { ApiProperty } from '@nestjs/swagger';
export default class DepositDto {
  @ApiProperty({
    description: 'Amount to be deposited',
    type: 'number',
  })
  @IsEnum(DepositAmount, {
    message: 'Amount can either be 5, 10, 20,50 or 100',
  })
  @IsNotEmpty({ message: 'Amount can either be 5, 10, 20,50 or 100' })
  amount: DepositAmount;
}
