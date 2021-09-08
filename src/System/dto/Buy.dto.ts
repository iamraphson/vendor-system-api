import { IsInt, Min } from 'class-validator';

export default class BuyDto {
  @IsInt()
  product_id: number;

  @Min(1)
  @IsInt()
  product_quantity: number;
}
