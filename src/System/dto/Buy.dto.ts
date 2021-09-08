import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export default class BuyDto {

  @ApiProperty({
    description: 'product id of the product you want to buy',
    type: 'number',
  })
  @IsInt()
  product_id: number;

  @ApiProperty({
    description: 'product quantity',
    type: 'number',
  })
  @Min(1)
  @IsInt()
  product_quantity: number;
}
