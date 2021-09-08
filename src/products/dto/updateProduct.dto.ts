import { IsString, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export default class UpdateProductDto {
  @ApiProperty({
    description: 'Available amount for product',
    type: 'number',
  })
  @Min(1)
  @IsOptional()
  @IsInt()
  amount_available?: number;

  @ApiProperty({
    description: 'Cost of the product',
    type: 'number',
  })
  @Min(5)
  @IsOptional()
  @IsInt()
  cost?: number;

  @ApiProperty({
    description: 'Product name',
    type: 'string',
  })
  @IsString()
  @IsOptional()
  product_name?: string;
}
