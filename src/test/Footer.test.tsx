import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Footer from '../components/Footer';
import { PersonalInfo } from '../types';

const mockPersonalInfo: PersonalInfo = {
  name: 'テスト太郎',
  title: 'フロントエンド開発者',
  description: 'テスト用の説明文です。',
  avatar: '/test-avatar.jpg',
};

describe('Footer', () => {
  it('renders personal info correctly', () => {
    render(<Footer personalInfo={mockPersonalInfo} />);

    expect(screen.getByText('テスト太郎')).toBeInTheDocument();
    expect(screen.getByText('フロントエンド開発者')).toBeInTheDocument();
  });

  it('displays current year in copyright', () => {
    render(<Footer personalInfo={mockPersonalInfo} />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`© ${currentYear}`))
    ).toBeInTheDocument();
  });

  it('displays thank you message', () => {
    render(<Footer personalInfo={mockPersonalInfo} />);

    expect(
      screen.getByText(/ご覧いただきありがとうございます/)
    ).toBeInTheDocument();
  });

  it('displays made with passion message', () => {
    render(<Footer personalInfo={mockPersonalInfo} />);

    expect(screen.getByText(/Made with passion/)).toBeInTheDocument();
  });

  it('has proper footer structure', () => {
    const { container } = render(<Footer personalInfo={mockPersonalInfo} />);

    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass(
      'bg-gradient-to-r',
      'from-secondary-800',
      'to-secondary-900'
    );
  });
});
