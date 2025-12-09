import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Icon } from './entities/icon.entity';
import { IconType } from './enums/icon-type.enum';
import { IconListDto } from './dto/response/icon-list.dto';

@Injectable()
export class IconsService {
  constructor(
    @InjectRepository(Icon)
    private readonly iconRepository: Repository<Icon>,
  ) {}

  /**
   * 아이콘 목록 조회
   * @param type 아이콘 타입 필터 (선택)
   * @param search 아이콘 이름 검색 (선택)
   */
  async findAll(type?: IconType, search?: string): Promise<IconListDto[]> {
    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (search) {
      where.name = Like(`%${search}%`);
    }

    const icons = await this.iconRepository.find({
      where,
      order: { name: 'ASC' },
    });

    return icons.map((icon) => ({
      id: icon.id,
      name: icon.name,
      type: icon.type,
    }));
  }

  /**
   * ID로 아이콘 조회
   * @param id 아이콘 ID
   */
  async findById(id: number): Promise<Icon | null> {
    return this.iconRepository.findOne({ where: { id } });
  }
}
