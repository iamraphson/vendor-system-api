import { IsString, IsInt, Min, IsOptional } from 'class-validator';
export default class UpdateProductDto {
  @Min(1)
  @IsOptional()
  @IsInt()
  amount_available?: number;

  @Min(5)
  @IsOptional()
  @IsInt()
  cost?: number;

  @IsString()
  @IsOptional()
  product_name?: string;
}
