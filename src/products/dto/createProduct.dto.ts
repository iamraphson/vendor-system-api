import { IsString, IsInt, IsNotEmpty, Min } from 'class-validator';
export default class CreateProductDto {
  @Min(1)
  @IsNotEmpty()
  @IsInt()
  amount_available: number;

  @Min(5)
  @IsNotEmpty()
  @IsInt()
  cost: number;

  @IsString()
  @IsNotEmpty()
  product_name: string;
}
